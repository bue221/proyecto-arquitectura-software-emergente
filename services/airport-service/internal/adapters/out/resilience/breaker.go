package resilience

import (
	"errors"
	"sync"
	"time"
)

var ErrOpen = errors.New("circuit breaker is open")

type State string

const (
	StateClosed   State = "closed"
	StateOpen     State = "open"
	StateHalfOpen State = "half_open"
)

// Breaker is a simple consecutive-failure circuit breaker.
type Breaker struct {
	mu               sync.Mutex
	failureThreshold int
	cooldown         time.Duration
	failures         int
	openUntil        time.Time
	halfOpenProbe    bool
	state            State
}

func NewBreaker(failureThreshold int, cooldown time.Duration) *Breaker {
	if failureThreshold <= 0 {
		failureThreshold = 5
	}
	if cooldown <= 0 {
		cooldown = 30 * time.Second
	}
	return &Breaker{
		failureThreshold: failureThreshold,
		cooldown:         cooldown,
		state:            StateClosed,
	}
}

func (b *Breaker) Allow() error {
	b.mu.Lock()
	defer b.mu.Unlock()
	now := time.Now()
	switch b.state {
	case StateOpen:
		if now.Before(b.openUntil) {
			return ErrOpen
		}
		b.state = StateHalfOpen
		b.halfOpenProbe = true
		return nil
	case StateHalfOpen:
		if b.halfOpenProbe {
			return ErrOpen
		}
		b.halfOpenProbe = true
		return nil
	default:
		return nil
	}
}

func (b *Breaker) Success() {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.failures = 0
	b.halfOpenProbe = false
	b.state = StateClosed
}

func (b *Breaker) Failure() {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.failures++
	b.halfOpenProbe = false
	if b.state == StateHalfOpen || b.failures >= b.failureThreshold {
		b.state = StateOpen
		b.openUntil = time.Now().Add(b.cooldown)
	}
}

func (b *Breaker) Snapshot() map[string]any {
	b.mu.Lock()
	defer b.mu.Unlock()
	return map[string]any{
		"state":             string(b.state),
		"failures":          b.failures,
		"failure_threshold": b.failureThreshold,
		"open_until":        b.openUntil.UTC().Format(time.RFC3339),
		"cooldown_seconds":  int(b.cooldown.Seconds()),
	}
}
