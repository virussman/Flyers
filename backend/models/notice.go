// ================================================================
// FILE: backend/models/notice.go
// ================================================================

package models

import (
	"time"
)

// ── Enums ─────────────────────────────────────────────────────

type NoticeType string
type NoticeStatus string

const (
	NoticeTypeSamvedana     NoticeType = "samvedana"
	NoticeTypeShraddhanjali NoticeType = "shraddhanjali"
	NoticeTypeBibaha        NoticeType = "bibaha"
	NoticeTypeBratabandha   NoticeType = "bratabandha"
	NoticeTypeGraduation    NoticeType = "graduation"
	NoticeTypeBirth         NoticeType = "birth"
	NoticeTypeBusiness      NoticeType = "business"

	NoticeStatusPending   NoticeStatus = "pending"
	NoticeStatusApproved  NoticeStatus = "approved"
	NoticeStatusRejected  NoticeStatus = "rejected"
	NoticeStatusExpired   NoticeStatus = "expired"
)

// ── Main Notice Model ───────────────────────────────────────────

type Notice struct {
	ID        int64        `json:"id"`
	UserID    int64        `json:"user_id,omitempty"`
	CreatedAt time.Time    `json:"created_at"`
	UpdatedAt time.Time    `json:"updated_at"`
	ExpiresAt time.Time    `json:"expires_at"`
	
	// Core fields
	NoticeType  NoticeType   `json:"notice_type"`
	Status      NoticeStatus `json:"notice_status"`
	DisplaySize string       `json:"display_size"`
	Title       string       `json:"title"`
	BodyText    string       `json:"body_text"`
	PublishedBy string       `json:"published_by"`
	ContactPhone string      `json:"contact_phone"`
	IsPremium   bool         `json:"is_premium"`
	TotalCost   float64      `json:"total_cost"`
	AdminNote   string       `json:"admin_note,omitempty"`
	
	// Obituary fields
	DeceasedName    string `json:"deceased_name,omitempty"`
	DeceasedNameEn  string `json:"deceased_name_en,omitempty"`
	DeceasedTitle   string `json:"deceased_title,omitempty"`
	BirthDateBS     string `json:"birth_date_bs,omitempty"`
	DeathDateBS     string `json:"death_date_bs,omitempty"`
	KriyaText       string `json:"kriya_text,omitempty"`
	FuneralLocation string `json:"funeral_location,omitempty"`
	FuneralDatetime string `json:"funeral_datetime,omitempty"`
	PhotoURL        string `json:"photo_url,omitempty"`
	
	// Celebration fields
	Person1Name     string `json:"person1_name,omitempty"`
	Person2Name     string `json:"person2_name,omitempty"`
	Person1PhotoURL string `json:"person1_photo_url,omitempty"`
	Person2PhotoURL string `json:"person2_photo_url,omitempty"`
	EventDateBS     string `json:"event_date_bs,omitempty"`
	EventDateAD     string `json:"event_date_ad,omitempty"`
	EventTime       string `json:"event_time,omitempty"`
	EventVenue      string `json:"event_venue,omitempty"`
	BlessingsFrom   string `json:"blessings_from,omitempty"`
	
	// Legal fields (admin only)
	AdvertiserName         string `json:"advertiser_name,omitempty"`
	AdvertiserCitizenship  string `json:"advertiser_citizenship,omitempty"`
	AdvertiserRelationship string `json:"advertiser_relationship,omitempty"`
	FamilyConsentAgreed    bool   `json:"family_consent_agreed"`
	TermsAgreed            bool   `json:"terms_agreed"`
	AdvertiserIDDocURL     string `json:"advertiser_id_doc_url,omitempty"`
	DeathCertURL           string `json:"death_cert_url,omitempty"`
}

// ── Create Request ──────────────────────────────────────────────

type CreateNoticeRequest struct {
	NoticeType  NoticeType `json:"notice_type"`
	DisplaySize string     `json:"display_size"`
	Title       string     `json:"title"`
	BodyText    string     `json:"body_text"`
	PublishedBy string     `json:"published_by"`
	ContactPhone string    `json:"contact_phone"`
	IsPremium   bool       `json:"is_premium"`
	
	// Obituary
	DeceasedName    string `json:"deceased_name"`
	DeceasedNameEn  string `json:"deceased_name_en"`
	DeceasedTitle   string `json:"deceased_title"`
	BirthDateBS     string `json:"birth_date_bs"`
	DeathDateBS     string `json:"death_date_bs"`
	KriyaText       string `json:"kriya_text"`
	FuneralLocation string `json:"funeral_location"`
	FuneralDatetime string `json:"funeral_datetime"`
	PhotoURL        string `json:"photo_url"`
	
	// Celebration
	Person1Name     string `json:"person1_name"`
	Person2Name     string `json:"person2_name"`
	Person1PhotoURL string `json:"person1_photo_url"`
	Person2PhotoURL string `json:"person2_photo_url"`
	EventDateBS     string `json:"event_date_bs"`
	EventDateAD     string `json:"event_date_ad"`
	EventTime       string `json:"event_time"`
	EventVenue      string `json:"event_venue"`
	BlessingsFrom   string `json:"blessings_from"`
	
	// Legal
	AdvertiserName         string `json:"advertiser_name"`
	AdvertiserCitizenship  string `json:"advertiser_citizenship"`
	AdvertiserRelationship string `json:"advertiser_relationship"`
	FamilyConsentAgreed    bool   `json:"family_consent_agreed"`
	TermsAgreed            bool   `json:"terms_agreed"`
}

// ── Update Request (FULL VERSION) ─────────────────────────────────

type UpdateNoticeRequest struct {
	// Core
	Title       string `json:"title"`
	BodyText    string `json:"body_text"`
	PublishedBy string `json:"published_by"`
	ContactPhone string `json:"contact_phone"`
	
	// Obituary
	DeceasedName    string `json:"deceased_name"`
	DeceasedNameEn  string `json:"deceased_name_en"`
	DeceasedTitle   string `json:"deceased_title"`
	BirthDateBS     string `json:"birth_date_bs"`
	DeathDateBS     string `json:"death_date_bs"`
	KriyaText       string `json:"kriya_text"`
	FuneralLocation string `json:"funeral_location"`
	FuneralDatetime string `json:"funeral_datetime"`
	PhotoURL        string `json:"photo_url"`
	
	// Celebration
	Person1Name     string `json:"person1_name"`
	Person2Name     string `json:"person2_name"`
	Person1PhotoURL string `json:"person1_photo_url"`
	Person2PhotoURL string `json:"person2_photo_url"`
	EventDateBS     string `json:"event_date_bs"`
	EventDateAD     string `json:"event_date_ad"`
	EventTime       string `json:"event_time"`
	EventVenue      string `json:"event_venue"`
	BlessingsFrom   string `json:"blessings_from"`
	
	// Admin only
	AdminNote string `json:"admin_note"`
}

// ── Filter ─────────────────────────────────────────────────────

// In models/notice.go — replace NoticeFilter struct with this:

type NoticeFilter struct {
	NoticeType NoticeType   `json:"notice_type"`
	Status     NoticeStatus `json:"status"`
	IsPremium  *bool        `json:"is_premium,omitempty"` // ← ADD THIS
	Page       int          `json:"page"`
	Limit      int          `json:"limit"`
}
// ── Helper Functions ────────────────────────────────────────────

func IsObituaryType(t NoticeType) bool {
	return t == NoticeTypeSamvedana || t == NoticeTypeShraddhanjali
}

func CalculateNoticeCost(displaySize string, isPremium bool) float64 {
    baseCost := 500.0
    if displaySize == "large" { baseCost = 1000.0 }
    if isPremium { baseCost *= 2 }
    return baseCost
}