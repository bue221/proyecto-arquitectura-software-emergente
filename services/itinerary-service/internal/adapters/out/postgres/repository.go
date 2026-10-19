package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) Create(ctx context.Context, itinerary domain.Itinerary, outbox domain.OutboxMessage) (domain.Itinerary, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return domain.Itinerary{}, fmt.Errorf("%w: begin: %v", domain.ErrPersistenceFailed, err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	_, err = tx.Exec(ctx, `
		INSERT INTO itineraries (
			id, user_name, origin_airport_id, destination_airport_id,
			travel_date, duration_minutes, created_at, updated_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		itinerary.ID,
		itinerary.UserName,
		itinerary.OriginAirportID,
		itinerary.DestinationAirportID,
		itinerary.TravelDate,
		itinerary.DurationMinutes,
		itinerary.CreatedAt,
		itinerary.UpdatedAt,
	)
	if err != nil {
		return domain.Itinerary{}, fmt.Errorf("%w: insert itinerary: %v", domain.ErrPersistenceFailed, err)
	}

	_, err = tx.Exec(ctx, `
		INSERT INTO outbox (
			id, aggregate_type, aggregate_id, event_type, payload, occurred_at
		) VALUES ($1,$2,$3,$4,$5,$6)`,
		outbox.ID,
		outbox.AggregateType,
		outbox.AggregateID,
		outbox.EventType,
		outbox.Payload,
		outbox.OccurredAt,
	)
	if err != nil {
		return domain.Itinerary{}, fmt.Errorf("%w: insert outbox: %v", domain.ErrPersistenceFailed, err)
	}

	if err := tx.Commit(ctx); err != nil {
		return domain.Itinerary{}, fmt.Errorf("%w: commit: %v", domain.ErrPersistenceFailed, err)
	}
	return itinerary, nil
}

func (r *Repository) Update(ctx context.Context, itinerary domain.Itinerary) (domain.Itinerary, error) {
	ct, err := r.pool.Exec(ctx, `
		UPDATE itineraries SET
			user_name=$2,
			origin_airport_id=$3,
			destination_airport_id=$4,
			travel_date=$5,
			duration_minutes=$6,
			updated_at=$7
		WHERE id=$1`,
		itinerary.ID,
		itinerary.UserName,
		itinerary.OriginAirportID,
		itinerary.DestinationAirportID,
		itinerary.TravelDate,
		itinerary.DurationMinutes,
		itinerary.UpdatedAt,
	)
	if err != nil {
		return domain.Itinerary{}, fmt.Errorf("%w: %v", domain.ErrPersistenceFailed, err)
	}
	if ct.RowsAffected() == 0 {
		return domain.Itinerary{}, domain.ErrNotFound
	}
	return itinerary, nil
}

func (r *Repository) Delete(ctx context.Context, id string) error {
	ct, err := r.pool.Exec(ctx, `DELETE FROM itineraries WHERE id=$1`, id)
	if err != nil {
		return fmt.Errorf("%w: %v", domain.ErrPersistenceFailed, err)
	}
	if ct.RowsAffected() == 0 {
		return domain.ErrNotFound
	}
	return nil
}

func (r *Repository) GetByID(ctx context.Context, id string) (domain.Itinerary, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT id, user_name, origin_airport_id, destination_airport_id,
		       travel_date, duration_minutes, created_at, updated_at
		FROM itineraries WHERE id=$1`, id)
	item, err := scanItinerary(row)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Itinerary{}, domain.ErrNotFound
	}
	return item, err
}

func (r *Repository) List(ctx context.Context) ([]domain.Itinerary, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_name, origin_airport_id, destination_airport_id,
		       travel_date, duration_minutes, created_at, updated_at
		FROM itineraries
		ORDER BY created_at DESC`)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", domain.ErrPersistenceFailed, err)
	}
	defer rows.Close()

	var items []domain.Itinerary
	for rows.Next() {
		item, err := scanItinerary(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

type scannable interface {
	Scan(dest ...any) error
}

func scanItinerary(row scannable) (domain.Itinerary, error) {
	var item domain.Itinerary
	var travelDate time.Time
	err := row.Scan(
		&item.ID,
		&item.UserName,
		&item.OriginAirportID,
		&item.DestinationAirportID,
		&travelDate,
		&item.DurationMinutes,
		&item.CreatedAt,
		&item.UpdatedAt,
	)
	if err != nil {
		return domain.Itinerary{}, err
	}
	item.TravelDate = travelDate
	return item, nil
}
