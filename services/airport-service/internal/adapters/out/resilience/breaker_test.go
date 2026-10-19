package resilience

import (
	"testing"
	"time"
)

func TestBreakerOpensAfterThreshold(t *testing.T) {
	b := NewBreaker(3, 50*time.Millisecond)
	for i := 0; i < 3; i++ {
		if err := b.Allow(); err != nil {
			t.Fatalf("allow before open: %v", err)
		}
		b.Failure()
	}
	if err := b.Allow(); err != ErrOpen {
		t.Fatalf("expected ErrOpen, got %v", err)
	}
	snap := b.Snapshot()
	if snap["state"] != string(StateOpen) {
		t.Fatalf("expected open state, got %v", snap["state"])
	}
}

func TestBreakerHalfOpenThenClose(t *testing.T) {
	b := NewBreaker(1, 20*time.Millisecond)
	_ = b.Allow()
	b.Failure()
	if err := b.Allow(); err != ErrOpen {
		t.Fatalf("expected open, got %v", err)
	}
	time.Sleep(25 * time.Millisecond)
	if err := b.Allow(); err != nil {
		t.Fatalf("expected half-open probe allow: %v", err)
	}
	b.Success()
	if err := b.Allow(); err != nil {
		t.Fatalf("expected closed after success: %v", err)
	}
	if b.Snapshot()["state"] != string(StateClosed) {
		t.Fatalf("expected closed, got %v", b.Snapshot()["state"])
	}
}
