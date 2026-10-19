package config

import "os"

type Config struct {
	DatabaseURL string
	RabbitMQURL string
	HTTPAddr    string
}

func Load() Config {
	return Config{
		DatabaseURL: getEnv("DATABASE_URL", "postgres://notify:notify@localhost:5435/notify?sslmode=disable"),
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),
		HTTPAddr:    getEnv("HTTP_ADDR", ":8083"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
