package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"flyers-backend/middleware"
	"flyers-backend/models"
	"flyers-backend/repositories"
)

type NoticeHandler struct {
	Repo *repositories.NoticeRepository
}

func NewNoticeHandler(repo *repositories.NoticeRepository) *NoticeHandler {
	return &NoticeHandler{Repo: repo}
}

func stripLegal(n *models.Notice) {
	n.AdvertiserName         = ""
	n.AdvertiserCitizenship  = ""
	n.AdvertiserIDDocURL     = ""
	n.DeathCertURL           = ""
	n.AdvertiserRelationship = ""
	n.FamilyConsentAgreed    = false
	n.TermsAgreed            = false
}

// ========== PUBLIC ROUTES ==========

func (h *NoticeHandler) ListNotices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	q := r.URL.Query()
	page, _  := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))

	filter := models.NoticeFilter{
		NoticeType: models.NoticeType(q.Get("type")),
		Page:       page,
		Limit:      limit,
	}

	notices, total, err := h.Repo.List(filter)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	for i := range notices {
		stripLegal(&notices[i])
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"notices": notices,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

func (h *NoticeHandler) GetNotice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/notices/")
	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil || id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notice ID"})
		return
	}

	n, err := h.Repo.GetByID(id)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}
	if n == nil || n.Status != models.NoticeStatusApproved {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Notice not found"})
		return
	}

	stripLegal(n)
	respondJSON(w, http.StatusOK, n)
}

func (h *NoticeHandler) CreateNotice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	var req models.CreateNoticeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if req.Title == "" || req.BodyText == "" || req.PublishedBy == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "title, body_text, published_by are required"})
		return
	}
	if req.NoticeType == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "notice_type is required"})
		return
	}
	if !req.TermsAgreed {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "must agree to terms and conditions"})
		return
	}

	if models.IsObituaryType(req.NoticeType) {
		if req.DeceasedName == "" {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "deceased_name is required for death notices"})
			return
		}
		if !req.FamilyConsentAgreed {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "family_consent_agreed is required for death notices"})
			return
		}
	}

	if req.DisplaySize == "" {
		req.DisplaySize = "small"
	}

	n := &models.Notice{
		UserID:      middleware.GetUserID(r),
		NoticeType:  req.NoticeType,
		Status:      models.NoticeStatusPending,
		DisplaySize: req.DisplaySize,

		Title:        req.Title,
		BodyText:     req.BodyText,
		PublishedBy:  req.PublishedBy,
		ContactPhone: req.ContactPhone,

		// Obituary
		DeceasedName:    req.DeceasedName,
		DeceasedNameEn:  req.DeceasedNameEn,
		DeceasedTitle:   req.DeceasedTitle,
		BirthDateBS:     req.BirthDateBS,
		DeathDateBS:     req.DeathDateBS,
		KriyaText:       req.KriyaText,
		FuneralLocation: req.FuneralLocation,
		FuneralDatetime: req.FuneralDatetime,
		PhotoURL:        req.PhotoURL,

		// Celebration
		Person1Name:     req.Person1Name,
		Person2Name:     req.Person2Name,
		Person1PhotoURL: req.Person1PhotoURL,
		Person2PhotoURL: req.Person2PhotoURL,
		EventDateBS:     req.EventDateBS,
		EventDateAD:     req.EventDateAD,
		EventTime:       req.EventTime,
		EventVenue:      req.EventVenue,
		BlessingsFrom:   req.BlessingsFrom,

		// Legal
		AdvertiserName:         req.AdvertiserName,
		AdvertiserCitizenship:  req.AdvertiserCitizenship,
		AdvertiserRelationship: req.AdvertiserRelationship,
		FamilyConsentAgreed:    req.FamilyConsentAgreed,
		TermsAgreed:            req.TermsAgreed,

		TotalCost: models.CalculateNoticeCost(req.DisplaySize, req.IsPremium),
		IsPremium: req.IsPremium,
	}

	if err := h.Repo.Create(n); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	stripLegal(n)
	respondJSON(w, http.StatusCreated, n)
}

func (h *NoticeHandler) MyNotices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	userID := middleware.GetUserID(r)
	if userID == 0 {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Unauthorized"})
		return
	}

	page, _  := strconv.Atoi(r.URL.Query().Get("page"))
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))

	notices, total, err := h.Repo.ListByUser(userID, page, limit)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"notices": notices,
		"total":   total,
	})
}

// ========== ADMIN ROUTES ==========

func (h *NoticeHandler) AdminListNotices(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	q := r.URL.Query()
	status := models.NoticeStatus(q.Get("status"))
	if status == "" {
		status = models.NoticeStatusPending
	}

	page, _  := strconv.Atoi(q.Get("page"))
	limit, _ := strconv.Atoi(q.Get("limit"))
	if limit == 0 {
		limit = 50
	}

	filter := models.NoticeFilter{
		NoticeType: models.NoticeType(q.Get("type")),
		Status:     status,
		Page:       page,
		Limit:      limit,
	}

	notices, total, err := h.Repo.List(filter)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"notices": notices,
		"total":   total,
	})
}

func (h *NoticeHandler) AdminGetNotice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/admin/notices/")
	path  = strings.Split(path, "/")[0]

	id, err := strconv.ParseInt(path, 10, 64)
	if err != nil || id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notice ID"})
		return
	}

	n, err := h.Repo.GetByID(id)
	if err != nil || n == nil {
		respondJSON(w, http.StatusNotFound, map[string]string{"error": "Notice not found"})
		return
	}

	respondJSON(w, http.StatusOK, n)
}

// ✅ ADD THIS NEW METHOD HERE — AdminEditNotice
func (h *NoticeHandler) AdminEditNotice(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPatch {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	id := extractNoticeIDFromAdminPath(r.URL.Path)
	if id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notice ID"})
		return
	}

	var req models.UpdateNoticeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if req.Title == "" || req.BodyText == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "title and body_text are required"})
		return
	}

	if err := h.Repo.Update(id, req); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	// Return updated notice
	n, err := h.Repo.GetByID(id)
	if err != nil || n == nil {
		respondJSON(w, http.StatusOK, map[string]string{"message": "Updated successfully"})
		return
	}

	respondJSON(w, http.StatusOK, n)
}

func (h *NoticeHandler) AdminApprove(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	id := extractNoticeIDFromAdminPath(r.URL.Path)
	if id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notice ID"})
		return
	}

	if err := h.Repo.UpdateStatus(id, models.NoticeStatusApproved, ""); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Notice approved"})
}

func (h *NoticeHandler) AdminReject(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	id := extractNoticeIDFromAdminPath(r.URL.Path)
	if id == 0 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid notice ID"})
		return
	}

	var body struct {
		Reason string `json:"reason"`
	}
	json.NewDecoder(r.Body).Decode(&body)

	if body.Reason == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "rejection reason is required"})
		return
	}

	if err := h.Repo.UpdateStatus(id, models.NoticeStatusRejected, body.Reason); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": err.Error()})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{"message": "Notice rejected"})
}

func extractNoticeIDFromAdminPath(path string) int64 {
	parts := strings.Split(strings.TrimPrefix(path, "/admin/notices/"), "/")
	if len(parts) == 0 {
		return 0
	}
	id, _ := strconv.ParseInt(parts[0], 10, 64)
	return id
}