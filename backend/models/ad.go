package models

import (
	"time"
)

type AdStatus string

const (
	StatusPending   AdStatus = "pending"
	StatusApproved  AdStatus = "approved"
	StatusRejected  AdStatus = "rejected"
	StatusExpired   AdStatus = "expired"
)

type Ad struct {
	ID            int64      `json:"id"`
	UserID        int64      `json:"user_id"` // ✅ ADD THIS - links ad to user (0 = anonymous)
	Title         string     `json:"title" validate:"required,max=200"`
	Description   string     `json:"description" validate:"required"`
	Category      string     `json:"category" validate:"required"`
	Price         float64    `json:"price,omitempty"` // For sale items
	WordCount     int        `json:"word_count"`
	TotalCost     float64    `json:"total_cost"`
	ContactPhone  string     `json:"contact_phone" validate:"required"`
	ContactEmail  string     `json:"contact_email,omitempty"`
	Location      string     `json:"location,omitempty"`
	Status        AdStatus   `json:"status"`
	IsPremium     bool       `json:"is_premium"`
	ImageURLs     []string   `json:"image_urls,omitempty"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	ExpiresAt     time.Time  `json:"expires_at"`
}

// CreateAdRequest for POST /ads
type CreateAdRequest struct {
	Title        string   `json:"title"`
	Description  string   `json:"description"`
	Category     string   `json:"category"`
	Price        float64  `json:"price,omitempty"`
	ContactPhone string   `json:"contact_phone"`
	ContactEmail string   `json:"contact_email,omitempty"`
	Location     string   `json:"location,omitempty"`
	IsPremium    bool     `json:"is_premium"`
	ImageURLs    []string `json:"image_urls,omitempty"`
}

// UpdateAdRequest for PUT /ads/:id
type UpdateAdRequest struct {
	Title        string   `json:"title,omitempty"`
	Description  string   `json:"description,omitempty"`
	Category     string   `json:"category,omitempty"`
	Price        float64  `json:"price,omitempty"`
	ContactPhone string   `json:"contact_phone,omitempty"`
	ContactEmail string   `json:"contact_email,omitempty"`
	Location     string   `json:"location,omitempty"`
	Status       AdStatus `json:"status,omitempty"`
	IsPremium    *bool    `json:"is_premium,omitempty"`
	ImageURLs    []string `json:"image_urls,omitempty"`
}

// AdFilter for GET /ads query parameters
type AdFilter struct {
	Category string   `json:"category,omitempty"`
	Location string   `json:"location,omitempty"`
	Status   AdStatus `json:"status,omitempty"`
	Page     int      `json:"page" default:"1"`
	Limit    int      `json:"limit" default:"20"`
}