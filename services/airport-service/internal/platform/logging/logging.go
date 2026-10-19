package logging

import (
	"context"
	"log/slog"
	"os"
)

type ctxKey string

const traceKey ctxKey = "trace_id"

func NewJSONLogger() *slog.Logger {
	return slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
}

func WithTraceID(ctx context.Context, traceID string) context.Context {
	return context.WithValue(ctx, traceKey, traceID)
}

func TraceIDFromContext(ctx context.Context) string {
	if v, ok := ctx.Value(traceKey).(string); ok {
		return v
	}
	return ""
}
