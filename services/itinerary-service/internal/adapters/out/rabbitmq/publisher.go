package rabbitmq

import (
	"context"
	"fmt"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ExchangeName = "itinerary.events"
	ExchangeType = "topic"
	// Declare consumer queue at publish time so messages are not dropped
	// if notification-function starts after the first outbox drain.
	NotifyQueueName = "notification.itinerary-created"
	NotifyRoutingKey = "itinerary.created"
)

// Publisher publishes JSON integration events to the itinerary topic exchange.
type Publisher struct {
	conn *amqp.Connection
	ch   *amqp.Channel
}

func Dial(url string) (*Publisher, error) {
	conn, err := amqp.Dial(url)
	if err != nil {
		return nil, fmt.Errorf("rabbitmq dial: %w", err)
	}
	ch, err := conn.Channel()
	if err != nil {
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq channel: %w", err)
	}
	if err := ch.ExchangeDeclare(ExchangeName, ExchangeType, true, false, false, false, nil); err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq exchange: %w", err)
	}
	if _, err := ch.QueueDeclare(NotifyQueueName, true, false, false, false, nil); err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq queue: %w", err)
	}
	if err := ch.QueueBind(NotifyQueueName, NotifyRoutingKey, ExchangeName, false, nil); err != nil {
		_ = ch.Close()
		_ = conn.Close()
		return nil, fmt.Errorf("rabbitmq bind: %w", err)
	}
	return &Publisher{conn: conn, ch: ch}, nil
}

func (p *Publisher) Publish(ctx context.Context, routingKey string, messageID string, body []byte) error {
	if p == nil || p.ch == nil {
		return fmt.Errorf("rabbitmq publisher not connected")
	}
	pubCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	return p.ch.PublishWithContext(pubCtx,
		ExchangeName,
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType:  "application/json",
			DeliveryMode: amqp.Persistent,
			MessageId:    messageID,
			Timestamp:    time.Now().UTC(),
			Type:         routingKey,
			Body:         body,
		},
	)
}

func (p *Publisher) Close() error {
	if p == nil {
		return nil
	}
	var first error
	if p.ch != nil {
		if err := p.ch.Close(); err != nil && first == nil {
			first = err
		}
	}
	if p.conn != nil {
		if err := p.conn.Close(); err != nil && first == nil {
			first = err
		}
	}
	return first
}
