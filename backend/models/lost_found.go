package models

import "time"

type LostFoundItem struct {
	ID          int64     `json:"id"`
	Type        string    `json:"type"`     // "lost" | "found"
	Category    string    `json:"category"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Location    string    `json:"location"`
	DateLost    *string   `json:"date_lost,omitempty"`
	Phone       string    `json:"phone"`
	Reward      string    `json:"reward,omitempty"`
	PhotoURL    string    `json:"photo_url,omitempty"`
	Status      string    `json:"status"` // "pending" | "active" | "rejected" | "resolved"
	CreatedAt   time.Time `json:"created_at"`
}

type CreateLostFoundRequest struct {
	Type        string  `json:"type"`
	Category    string  `json:"category"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Location    string  `json:"location"`
	DateLost    *string `json:"date_lost,omitempty"`
	Phone       string  `json:"phone"`
	Reward      string  `json:"reward,omitempty"`
	PhotoURL    string  `json:"photo_url,omitempty"`
}