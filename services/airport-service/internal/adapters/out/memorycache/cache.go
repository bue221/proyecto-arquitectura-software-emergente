package memorycache

import (
	"context"
	"sync"
	"time"
)

type entry struct {
	value     []byte
	expiresAt time.Time
}

// Cache is a process-local TTL cache used until Redis lands (Level 2).
type Cache struct {
	mu    sync.RWMutex
	ttl   time.Duration
	items map[string]entry
}

func New(ttl time.Duration) *Cache {
	if ttl <= 0 {
		ttl = 5 * time.Minute
	}
	return &Cache{
		ttl:   ttl,
		items: make(map[string]entry),
	}
}

func (c *Cache) Get(_ context.Context, key string) ([]byte, bool, error) {
	c.mu.RLock()
	e, ok := c.items[key]
	c.mu.RUnlock()
	if !ok {
		return nil, false, nil
	}
	if time.Now().After(e.expiresAt) {
		c.mu.Lock()
		delete(c.items, key)
		c.mu.Unlock()
		return nil, false, nil
	}
	cp := make([]byte, len(e.value))
	copy(cp, e.value)
	return cp, true, nil
}

func (c *Cache) Set(_ context.Context, key string, value []byte) error {
	cp := make([]byte, len(value))
	copy(cp, value)
	c.mu.Lock()
	c.items[key] = entry{value: cp, expiresAt: time.Now().Add(c.ttl)}
	c.mu.Unlock()
	return nil
}
