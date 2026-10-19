package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/bue221/personal-itineraries/services/notification-function/internal/domain"
)

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) SaveIdempotent(ctx context.Context, record domain.NotificationRecord) (bool, error) {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO notification_records (
			id, event_id, itinerary_id, channel, status, payload, created_at
		) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		record.ID,
		record.EventID,
		record.ItineraryID,
		record.Channel,
		record.Status,
		record.Payload,
		record.CreatedAt,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return false, nil
		}
		return false, fmt.Errorf("%w: %v", domain.ErrPersistenceFailed, err)
	}
	return true, nil
}
