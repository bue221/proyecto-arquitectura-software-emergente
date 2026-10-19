package resilience

import (
	"context"
	"errors"
	"sync/atomic"
)

var ErrBulkheadFull = errors.New("bulkhead is full")

// Bulkhead limits concurrent upstream calls (semaphore isolation).
type Bulkhead struct {
	sem     chan struct{}
	active  atomic.Int64
	rejected atomic.Int64
	max     int
}

func NewBulkhead(maxConcurrent int) *Bulkhead {
	if maxConcurrent <= 0 {
		maxConcurrent = 8
	}
	return &Bulkhead{
		sem: make(chan struct{}, maxConcurrent),
		max: maxConcurrent,
	}
}

func (b *Bulkhead) Execute(ctx context.Context, fn func(context.Context) error) error {
	select {
	case b.sem <- struct{}{}:
		b.active.Add(1)
		defer func() {
			<-b.sem
			b.active.Add(-1)
		}()
		return fn(ctx)
	case <-ctx.Done():
		return ctx.Err()
	default:
		b.rejected.Add(1)
		return ErrBulkheadFull
	}
}

func (b *Bulkhead) Snapshot() map[string]any {
	return map[string]any{
		"max_concurrent": b.max,
		"active":         b.active.Load(),
		"rejected":       b.rejected.Load(),
	}
}
