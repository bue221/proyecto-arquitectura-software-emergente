package domain_test

import (
	"testing"

	"github.com/bue221/personal-itineraries/services/itinerary-service/internal/domain"
)

func TestPageQuery_Normalize(t *testing.T) {
	got := domain.PageQuery{Page: 0, PageSize: 0}.Normalize()
	if got.Page != 1 || got.PageSize != 20 {
		t.Fatalf("defaults: %+v", got)
	}
	got = domain.PageQuery{Page: 2, PageSize: 500}.Normalize()
	if got.PageSize != 100 {
		t.Fatalf("cap pageSize: %+v", got)
	}
	if got.Offset() != 100 {
		t.Fatalf("offset want 100 got %d", got.Offset())
	}
}
