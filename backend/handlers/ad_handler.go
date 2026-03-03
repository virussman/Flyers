package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"flyers-backend/middleware"
	"flyers-backend/models"
	"flyers-backend/repositories"
	"flyers-backend/services"
)

type AdHandler struct {
	Repo *repositories.AdRepository
}

func NewAdHandler(repo *repositories.AdRepository) *AdHandler {
	return &AdHandler{Repo: repo}
}

func (h *AdHandler) CreateAd(w http.ResponseWriter, r *http.Request) {
	var req models.CreateAdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	if req.Title == "" || req.Description == "" || req.Category == "" || req.ContactPhone == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
		return
	}

	wordCount, totalCost := services.CalculatePrice(req.Description, req.IsPremium)

	// Attach user_id if logged in
	userID := middleware.GetUserID(r)

	ad := &models.Ad{
		Title:        req.Title,
		Description:  req.Description,
		Category:     req.Category,
		Price:        req.Price,
		WordCount:    wordCount,
		TotalCost:    totalCost,
		ContactPhone: req.ContactPhone,
		ContactEmail: req.ContactEmail,
		Location:     req.Location,
		Status:       models.StatusPending,
		IsPremium:    req.IsPremium,
		ImageURLs:    req.ImageURLs,
		UserID:       userID,
	}

	if err := h.Repo.Create(ad); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusCreated, ad)
}

// MyAds — GET /ads/mine — returns only ads belonging to the logged-in user
func (h *AdHandler) MyAds(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	page, limit := 1, 20
	if p, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil && p > 0 {
		page = p
	}

	ads, total, err := h.Repo.ListByUser(userID, page, limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []models.Ad{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"data": ads, "total": total, "page": page, "limit": limit,
	})
}

func (h *AdHandler) GetAd(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/ads/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
		return
	}
	ad, err := h.Repo.GetByID(id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if ad == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Ad not found"})
		return
	}
	respondJSON(w, http.StatusOK, ad)
}

func (h *AdHandler) ListAds(w http.ResponseWriter, r *http.Request) {
	filter := models.AdFilter{Page: 1, Limit: 20}
	if category := r.URL.Query().Get("category"); category != "" {
		filter.Category = category
	}
	if location := r.URL.Query().Get("location"); location != "" {
		filter.Location = location
	}
	if status := r.URL.Query().Get("status"); status != "" {
		filter.Status = models.AdStatus(status)
	}
	if page, err := strconv.Atoi(r.URL.Query().Get("page")); err == nil && page > 0 {
		filter.Page = page
	}
	if limit, err := strconv.Atoi(r.URL.Query().Get("limit")); err == nil && limit > 0 {
		filter.Limit = limit
	}
	ads, total, err := h.Repo.List(filter)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if ads == nil {
		ads = []models.Ad{}
	}
	respondJSON(w, http.StatusOK, map[string]interface{}{
		"data": ads, "total": total, "page": filter.Page, "limit": filter.Limit,
	})
}

func (h *AdHandler) UpdateAdStatus(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/ads/")
	path = strings.TrimSuffix(path, "/status")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
		return
	}
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	valid := map[string]bool{"pending": true, "approved": true, "rejected": true, "expired": true}
	if !valid[body.Status] {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid status"})
		return
	}
	if err := h.Repo.UpdateStatus(id, models.AdStatus(body.Status)); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Status updated"})
}

func (h *AdHandler) GetStats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.Repo.GetStats()
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, stats)
}

func (h *AdHandler) UpdateAd(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/ads/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
		return
	}
	var req models.UpdateAdRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	existing, err := h.Repo.GetByID(id)
	if err != nil || existing == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Ad not found"})
		return
	}

	// Only owner or admin can edit
	userID := middleware.GetUserID(r)
	role   := middleware.GetUserRole(r)
	if userID != 0 && role != "admin" && existing.UserID != userID {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Not your ad"})
		return
	}

	description := existing.Description
	if req.Description != "" { description = req.Description }
	isPremium := existing.IsPremium
	if req.IsPremium != nil { isPremium = *req.IsPremium }
	wordCount, totalCost := services.CalculatePrice(description, isPremium)

	if err := h.Repo.Update(id, req, totalCost, wordCount); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Updated successfully"})
}

func (h *AdHandler) DeleteAd(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/ads/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid ID"})
		return
	}
	existing, err := h.Repo.GetByID(id)
	if err != nil || existing == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Ad not found"})
		return
	}

	// Only owner or admin can delete
	userID := middleware.GetUserID(r)
	role   := middleware.GetUserRole(r)
	if userID != 0 && role != "admin" && existing.UserID != userID {
		respondJSON(w, http.StatusForbidden, map[string]string{"error": "Not your ad"})
		return
	}

	if err := h.Repo.Delete(id); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	respondJSON(w, http.StatusOK, map[string]string{"message": "Deleted successfully"})
}

func (h *AdHandler) CalculatePricePreview(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Description string `json:"description"`
		IsPremium   bool   `json:"is_premium"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	wordCount, _ := services.CalculatePrice(req.Description, req.IsPremium)
	respondJSON(w, http.StatusOK, services.GetPricingInfo(wordCount, req.IsPremium))
}

func respondJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}