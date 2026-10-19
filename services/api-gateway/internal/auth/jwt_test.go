package auth

import (
	"testing"
	"time"
)

func TestIssueAndParse(t *testing.T) {
	svc := NewTokenService("secret", "test-issuer", time.Hour)
	token, _, err := svc.Issue("ana", "traveler")
	if err != nil {
		t.Fatal(err)
	}
	claims, err := svc.Parse(token)
	if err != nil {
		t.Fatal(err)
	}
	if claims.Sub != "ana" || claims.Role != "traveler" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
}

func TestParseRejectsEmpty(t *testing.T) {
	svc := NewTokenService("secret", "test-issuer", time.Hour)
	if _, err := svc.Parse(""); err == nil {
		t.Fatal("expected error")
	}
}
