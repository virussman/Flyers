// ================================================================
// FILE: handlers/sponsor_handler.go
// ================================================================
package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

type SponsorHandler struct{ DB *sql.DB }

func NewSponsorHandler(db *sql.DB) *SponsorHandler { return &SponsorHandler{DB: db} }

type Sponsor struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Category     string `json:"category"`
	Location     string `json:"location"`
	WebsiteURL   string `json:"website_url"`
	LogoURL      string `json:"logo_url"`
	Tier         string `json:"tier"`
	Status       string `json:"status"`
	DisplayOrder int    `json:"display_order"`
	Tagline      string `json:"tagline"`
	OfferText    string `json:"offer_text"`
	OfferBadge   string `json:"offer_badge"`
	CreatedAt    string `json:"created_at"`
}

func scanSponsors(rows *sql.Rows) []Sponsor {
	out := make([]Sponsor, 0)
	for rows.Next() {
		var s Sponsor
		rows.Scan(
			&s.ID, &s.Name, &s.Category, &s.Location, &s.WebsiteURL,
			&s.LogoURL, &s.Tier, &s.Status, &s.DisplayOrder,
			&s.Tagline, &s.OfferText, &s.OfferBadge, &s.CreatedAt,
		)
		out = append(out, s)
	}
	return out
}

func strF(req map[string]interface{}, k string) string {
	if v, ok := req[k].(string); ok { return strings.TrimSpace(v) }
	return ""
}
func intF(req map[string]interface{}, k string) int {
	if v, ok := req[k].(float64); ok { return int(v) }
	return 0
}

const selectCols = `id, name, category, location, website_url, logo_url, tier, status,
	display_order, tagline, offer_text, offer_badge, created_at`

// GET /sponsors — public, active only
func (h *SponsorHandler) List(w http.ResponseWriter, r *http.Request) {
	limit := 8
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && l > 0 { limit = l }
	rows, err := h.DB.Query(`SELECT `+selectCols+` FROM sponsors
		WHERE status='active' ORDER BY display_order ASC, created_at ASC LIMIT $1`, limit)
	if err != nil { respondJSON(w, 500, map[string]string{"error": err.Error()}); return }
	defer rows.Close()
	respondJSON(w, 200, map[string]interface{}{"sponsors": scanSponsors(rows)})
}

// GET /admin/sponsors — all
func (h *SponsorHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	rows, err := h.DB.Query(`SELECT ` + selectCols + ` FROM sponsors
		ORDER BY display_order ASC, created_at ASC`)
	if err != nil { respondJSON(w, 500, map[string]string{"error": err.Error()}); return }
	defer rows.Close()
	respondJSON(w, 200, map[string]interface{}{"sponsors": scanSponsors(rows)})
}

// POST /admin/sponsors
func (h *SponsorHandler) AdminCreate(w http.ResponseWriter, r *http.Request) {
	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, 400, map[string]string{"error": "bad request"}); return
	}
	name := strF(req, "name")
	if name == "" { respondJSON(w, 400, map[string]string{"error": "name is required"}); return }

	tier := "Featured"
	if t := strF(req, "tier"); t == "Gold" || t == "Featured" { tier = t }
	status := "active"
	if s := strF(req, "status"); s == "active" || s == "inactive" { status = s }

	var id int64
	err := h.DB.QueryRow(`
		INSERT INTO sponsors
			(name, category, location, website_url, logo_url, tier, status,
			 display_order, tagline, offer_text, offer_badge)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
		name, strF(req,"category"), strF(req,"location"),
		strF(req,"website_url"), strF(req,"logo_url"),
		tier, status, intF(req,"display_order"),
		strF(req,"tagline"), strF(req,"offer_text"), strF(req,"offer_badge"),
	).Scan(&id)
	if err != nil { respondJSON(w, 500, map[string]string{"error": err.Error()}); return }
	respondJSON(w, 201, map[string]interface{}{"id": id, "message": "created"})
}

// PATCH /admin/sponsors/:id
func (h *SponsorHandler) AdminUpdate(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	id, err := strconv.ParseInt(parts[len(parts)-1], 10, 64)
	if err != nil { respondJSON(w, 400, map[string]string{"error": "invalid id"}); return }

	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, 400, map[string]string{"error": "bad request"}); return
	}
	tier := "Featured"
	if t := strF(req, "tier"); t == "Gold" || t == "Featured" { tier = t }
	status := "active"
	if s := strF(req, "status"); s == "active" || s == "inactive" { status = s }

	_, err = h.DB.Exec(`
		UPDATE sponsors SET
			name=$1, category=$2, location=$3, website_url=$4, logo_url=$5,
			tier=$6, status=$7, display_order=$8,
			tagline=$9, offer_text=$10, offer_badge=$11,
			updated_at=NOW()
		WHERE id=$12`,
		strF(req,"name"), strF(req,"category"), strF(req,"location"),
		strF(req,"website_url"), strF(req,"logo_url"),
		tier, status, intF(req,"display_order"),
		strF(req,"tagline"), strF(req,"offer_text"), strF(req,"offer_badge"),
		id,
	)
	if err != nil { respondJSON(w, 500, map[string]string{"error": err.Error()}); return }
	respondJSON(w, 200, map[string]string{"message": "updated"})
}

// DELETE /admin/sponsors/:id
func (h *SponsorHandler) AdminDelete(w http.ResponseWriter, r *http.Request) {
	parts := strings.Split(strings.Trim(r.URL.Path, "/"), "/")
	id, err := strconv.ParseInt(parts[len(parts)-1], 10, 64)
	if err != nil { respondJSON(w, 400, map[string]string{"error": "invalid id"}); return }
	h.DB.Exec(`DELETE FROM sponsors WHERE id=$1`, id)
	respondJSON(w, 200, map[string]string{"message": "deleted"})
}