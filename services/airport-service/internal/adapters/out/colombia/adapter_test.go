package colombia

import "testing"

func TestNormalizeCoordinates_SwapsInvertedAPIValues(t *testing.T) {
	lat, lon := normalizeCoordinates(-75.7659806671205, 4.4532428642135)
	if lat < 4 || lat > 5 {
		t.Fatalf("expected Colombian latitude around 4.45, got %v", lat)
	}
	if lon > -75 || lon < -76 {
		t.Fatalf("expected Colombian longitude around -75.76, got %v", lon)
	}
}

func TestNormalizeCoordinates_KeepsAlreadyCorrect(t *testing.T) {
	lat, lon := normalizeCoordinates(4.45, -75.76)
	if lat != 4.45 || lon != -75.76 {
		t.Fatalf("unexpected swap: %v,%v", lat, lon)
	}
}
