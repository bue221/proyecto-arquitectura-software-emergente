package memorycache

import (
	"context"
	"testing"
	"time"
)

func TestCache_GetSetAndExpire(t *testing.T) {
	ctx := context.Background()
	c := New(20 * time.Millisecond)

	if _, ok, err := c.Get(ctx, "airports"); err != nil || ok {
		t.Fatalf("empty cache should miss: ok=%v err=%v", ok, err)
	}

	if err := c.Set(ctx, "airports", []byte(`[{"id":"1"}]`)); err != nil {
		t.Fatal(err)
	}
	got, ok, err := c.Get(ctx, "airports")
	if err != nil || !ok {
		t.Fatalf("expected hit: ok=%v err=%v", ok, err)
	}
	if string(got) != `[{"id":"1"}]` {
		t.Fatalf("value=%s", got)
	}

	// Mutating the returned slice must not corrupt the cache entry.
	got[0] = 'x'
	again, ok, err := c.Get(ctx, "airports")
	if err != nil || !ok || string(again) != `[{"id":"1"}]` {
		t.Fatalf("cache entry mutated: ok=%v value=%s err=%v", ok, again, err)
	}

	time.Sleep(30 * time.Millisecond)
	if _, ok, err := c.Get(ctx, "airports"); err != nil || ok {
		t.Fatalf("expected TTL miss: ok=%v err=%v", ok, err)
	}
}

func TestCache_DefaultTTL(t *testing.T) {
	c := New(0)
	if c.ttl <= 0 {
		t.Fatalf("expected positive default ttl, got %s", c.ttl)
	}
}
