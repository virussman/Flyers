package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"flyers-backend/models"
	"flyers-backend/repositories"
)

type LostFoundHandler struct {
	Repo *repositories.LostFoundRepository
}

func NewLostFoundHandler(repo *repositories.LostFoundRepository) *LostFoundHandler {
	return &LostFoundHandler{Repo: repo}
}

// GET /lost-found?limit=8  — public, active only
func (h *LostFoundHandler) List(w http.ResponseWriter, r *http.Request) {
	limit := 8
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && l > 0 && l <= 50 {
		limit = l
	}
	items, err := h.Repo.List(limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{"items": items})
}

// POST /lost-found  — public submission, saved as 'pending'
func (h *LostFoundHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req models.CreateLostFoundRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
		return
	}

	req.Type        = strings.TrimSpace(req.Type)
	req.Title       = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	req.Phone       = strings.TrimSpace(req.Phone)
	req.Location    = strings.TrimSpace(req.Location)

	if req.Type != "lost" && req.Type != "found" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "type must be 'lost' or 'found'"})
		return
	}
	if req.Title == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "title is required"})
		return
	}
	if len(req.Description) < 20 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "description must be at least 20 characters"})
		return
	}
	if req.Phone == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "phone is required"})
		return
	}
	if req.Location == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "location is required"})
		return
	}

	item, err := h.Repo.Create(req)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusCreated, map[string]interface{}{"item": item})
}

// GET /admin/lost-found?status=pending&limit=50  — admin
func (h *LostFoundHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	status := r.URL.Query().Get("status")
	if status == "" {
		status = "pending"
	}
	limit := 50
	if l, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && l > 0 && l <= 100 {
		limit = l
	}
	items, err := h.Repo.AdminList(status, limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"reports": items,
		"total":   len(items),
		"status":  status,
	})
}

// POST /admin/lost-found/:id/approve
func (h *LostFoundHandler) AdminApprove(w http.ResponseWriter, r *http.Request) {
	id, err := extractLFID(r.URL.Path)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	if err := h.Repo.AdminApprove(id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"status": "approved"})
}

// POST /admin/lost-found/:id/reject
func (h *LostFoundHandler) AdminReject(w http.ResponseWriter, r *http.Request) {
	id, err := extractLFID(r.URL.Path)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid id"})
		return
	}
	if err := h.Repo.AdminReject(id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"status": "rejected"})
}

// extractLFID parses the numeric id from paths like /admin/lost-found/42/approve
func extractLFID(path string) (int64, error) {
	// strip trailing action segment (/approve or /reject)
	path = strings.TrimSuffix(path, "/approve")
	path = strings.TrimSuffix(path, "/reject")
	// last segment is the id
	parts := strings.Split(strings.Trim(path, "/"), "/")
	return strconv.ParseInt(parts[len(parts)-1], 10, 64)
}