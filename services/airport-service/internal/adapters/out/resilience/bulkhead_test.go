package resilience_test

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/bue221/personal-itineraries/services/airport-service/internal/adapters/out/resilience"
)

func TestBulkhead_RejectsWhenFull(t *testing.T) {
	bh := resilience.NewBulkhead(1)
	started := make(chan struct{})
	release := make(chan struct{})

	var wg sync.WaitGroup
	wg.Add(1)
	go func() {
		defer wg.Done()
		_ = bh.Execute(context.Background(), func(ctx context.Context) error {
			close(started)
			<-release
			return nil
		})
	}()

	<-started
	err := bh.Execute(context.Background(), func(ctx context.Context) error { return nil })
	if err != resilience.ErrBulkheadFull {
		t.Fatalf("want ErrBulkheadFull got %v", err)
	}
	close(release)
	wg.Wait()
}

func TestBulkhead_AllowsAfterRelease(t *testing.T) {
	bh := resilience.NewBulkhead(1)
	if err := bh.Execute(context.Background(), func(ctx context.Context) error {
		time.Sleep(5 * time.Millisecond)
		return nil
	}); err != nil {
		t.Fatal(err)
	}
	if err := bh.Execute(context.Background(), func(ctx context.Context) error { return nil }); err != nil {
		t.Fatal(err)
	}
}
