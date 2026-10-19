package auth

import (
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrMissingToken = errors.New("missing bearer token")
	ErrInvalidToken = errors.New("invalid token")
)

type Claims struct {
	Sub  string `json:"sub"`
	Role string `json:"role,omitempty"`
	jwt.RegisteredClaims
}

type TokenService struct {
	secret []byte
	issuer string
	ttl    time.Duration
}

func NewTokenService(secret, issuer string, ttl time.Duration) *TokenService {
	return &TokenService{secret: []byte(secret), issuer: issuer, ttl: ttl}
}

func (s *TokenService) Issue(subject, role string) (string, time.Time, error) {
	if subject == "" {
		return "", time.Time{}, fmt.Errorf("%w: empty subject", ErrInvalidToken)
	}
	if role == "" {
		role = "traveler"
	}
	expires := time.Now().UTC().Add(s.ttl)
	claims := Claims{
		Sub:  subject,
		Role: role,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    s.issuer,
			Subject:   subject,
			ExpiresAt: jwt.NewNumericDate(expires),
			IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(s.secret)
	if err != nil {
		return "", time.Time{}, err
	}
	return signed, expires, nil
}

func (s *TokenService) Parse(raw string) (*Claims, error) {
	if raw == "" {
		return nil, ErrMissingToken
	}
	parsed, err := jwt.ParseWithClaims(raw, &Claims{}, func(t *jwt.Token) (any, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, fmt.Errorf("%w: unexpected signing method", ErrInvalidToken)
		}
		return s.secret, nil
	})
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalidToken, err)
	}
	claims, ok := parsed.Claims.(*Claims)
	if !ok || !parsed.Valid {
		return nil, ErrInvalidToken
	}
	return claims, nil
}
