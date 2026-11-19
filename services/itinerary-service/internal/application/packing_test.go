package application

import (
	"strings"
	"testing"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

func TestNormalizePacking_TrimsSkipsAndCaps(t *testing.T) {
	got, err := normalizePacking([]domain.PackingItem{
		{ID: "a", Label: "  Socks  ", Packed: true, Category: "clothes"},
		{Label: "   "},
		{Label: "Passport", Category: strings.Repeat("c", 40)},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 2 {
		t.Fatalf("len=%d", len(got))
	}
	if got[0].Label != "Socks" || !got[0].Packed {
		t.Fatalf("first=%+v", got[0])
	}
	if got[1].ID == "" {
		t.Fatal("expected generated id")
	}
	if len(got[1].Category) != 32 {
		t.Fatalf("category len=%d", len(got[1].Category))
	}
}

func TestNormalizePacking_RejectsOverLimit(t *testing.T) {
	items := make([]domain.PackingItem, maxPackingItems+1)
	for i := range items {
		items[i] = domain.PackingItem{Label: "x"}
	}
	if _, err := normalizePacking(items); err != domain.ErrInvalidInput {
		t.Fatalf("err=%v", err)
	}
}

func TestNormalizePlans_DefaultsSourceAndRejectsLongTitle(t *testing.T) {
	got, err := normalizePlans([]domain.PlanItem{
		{Title: "  Café  ", Description: "y", Selected: true},
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(got) != 1 || got[0].Source != "custom" || got[0].Title != "Café" {
		t.Fatalf("got=%+v", got)
	}

	if _, err := normalizePlans([]domain.PlanItem{{Title: strings.Repeat("t", 101)}}); err != domain.ErrInvalidInput {
		t.Fatalf("err=%v", err)
	}
}
