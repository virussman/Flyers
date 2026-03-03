package routes

import (
	"database/sql"
	"net/http"
	"strings"

	"flyers-backend/handlers"
	"flyers-backend/middleware"
	"flyers-backend/repositories"
)

func RegisterRoutes(db *sql.DB) *http.ServeMux {
	mux := http.NewServeMux()

	// Repositories
	adRepo   := repositories.NewAdRepository(db)
	userRepo := repositories.NewUserRepository(db)

	// Handlers
	adHandler   := handlers.NewAdHandler(adRepo)
	authHandler := handlers.NewAuthHandler(userRepo)

	// ── Health ─────────────────────────────────────────
	mux.HandleFunc("/health", handlers.HealthCheck)

	// ── Auth routes ────────────────────────────────────
	mux.HandleFunc("/auth/send-otp", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodPost { http.Error(w, "Method not allowed", 405); return }
		authHandler.SendOTP(w, r)
	})

	mux.HandleFunc("/auth/verify-otp", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodPost { http.Error(w, "Method not allowed", 405); return }
		authHandler.VerifyOTP(w, r)
	})

	mux.HandleFunc("/auth/me", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		middleware.RequireAuth(authHandler.Me)(w, r)
	})

	// ── Ad stats (admin) ───────────────────────────────
	mux.HandleFunc("/ads/stats", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		adHandler.GetStats(w, r)
	})

	// ── Calculate price ────────────────────────────────
	mux.HandleFunc("/ads/calculate-price", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		adHandler.CalculatePricePreview(w, r)
	})

	// ── My ads ─────────────────────────────────────────
	mux.HandleFunc("/ads/mine", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		middleware.RequireAuth(adHandler.MyAds)(w, r)
	})

	// ── /ads/:id/status ────────────────────────────────
	// ── /ads/:id ───────────────────────────────────────
	mux.HandleFunc("/ads/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }

		path := strings.TrimPrefix(r.URL.Path, "/ads/")

		if strings.HasSuffix(path, "/status") && r.Method == http.MethodPatch {
			adHandler.UpdateAdStatus(w, r)
			return
		}

		switch r.Method {
		case http.MethodGet:
			if path == "" {
				adHandler.ListAds(w, r)
			} else {
				adHandler.GetAd(w, r)
			}
		case http.MethodPut:
			// Only owner or admin can edit
			middleware.OptionalAuth(adHandler.UpdateAd)(w, r)
		case http.MethodDelete:
			middleware.OptionalAuth(adHandler.DeleteAd)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// ── /ads ───────────────────────────────────────────
	mux.HandleFunc("/ads", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodGet:
			adHandler.ListAds(w, r)
		case http.MethodPost:
			// Auth optional for now — attach user_id if logged in
			middleware.OptionalAuth(adHandler.CreateAd)(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	return mux
}