package rabbitmq

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ExchangeName = "itinerary.events"
	ExchangeType = "topic"
	QueueName    = "notification.itinerary-created"
	RoutingKey   = "itinerary.created"
)

type Handler func(ctx context.Context, body []byte) error

// Consumer binds the notification queue and invokes the FaaS-style handler.
type Consumer struct {
	url string
	log *slog.Logger
}

func NewConsumer(url string, log *slog.Logger) *Consumer {
	return &Consumer{url: url, log: log}
}

func (c *Consumer) Run(ctx context.Context, handle Handler) error {
	for {
		if err := c.consumeOnce(ctx, handle); err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			c.log.Error("rabbitmq_consumer_restart", "error", err.Error())
			select {
			case <-ctx.Done():
				return ctx.Err()
			case <-time.After(3 * time.Second):
			}
			continue
		}
		return nil
	}
}

func (c *Consumer) consumeOnce(ctx context.Context, handle Handler) error {
	conn, err := amqp.Dial(c.url)
	if err != nil {
		return fmt.Errorf("dial: %w", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return fmt.Errorf("channel: %w", err)
	}
	defer ch.Close()

	if err := ch.ExchangeDeclare(ExchangeName, ExchangeType, true, false, false, false, nil); err != nil {
		return fmt.Errorf("exchange: %w", err)
	}
	q, err := ch.QueueDeclare(QueueName, true, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("queue: %w", err)
	}
	if err := ch.QueueBind(q.Name, RoutingKey, ExchangeName, false, nil); err != nil {
		return fmt.Errorf("bind: %w", err)
	}
	if err := ch.Qos(1, 0, false); err != nil {
		return fmt.Errorf("qos: %w", err)
	}

	deliveries, err := ch.Consume(q.Name, "notification-function", false, false, false, false, nil)
	if err != nil {
		return fmt.Errorf("consume: %w", err)
	}
	c.log.Info("notification_consumer_ready", "queue", q.Name, "routing_key", RoutingKey)

	for {
		select {
		case <-ctx.Done():
			return ctx.Err()
		case d, ok := <-deliveries:
			if !ok {
				return fmt.Errorf("deliveries channel closed")
			}
			if err := handle(ctx, d.Body); err != nil {
				c.log.Error("notification_handler_failed", "error", err.Error(), "message_id", d.MessageId)
				_ = d.Nack(false, true)
				continue
			}
			_ = d.Ack(false)
		}
	}
}
