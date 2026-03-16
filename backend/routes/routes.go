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
	adRepo     := repositories.NewAdRepository(db)
	userRepo   := repositories.NewUserRepository(db)
	noticeRepo := repositories.NewNoticeRepository(db)
	lfRepo     := repositories.NewLostFoundRepository(db)

	// Handlers
	adHandler      := handlers.NewAdHandler(adRepo)
	authHandler    := handlers.NewAuthHandler(userRepo)
	noticeHandler  := handlers.NewNoticeHandler(noticeRepo)
	uploadHandler  := handlers.NewUploadHandler()
	lfHandler      := handlers.NewLostFoundHandler(lfRepo)
	sponsorHandler := handlers.NewSponsorHandler(db)

	// ── Health ───────────────────────────────────────────
	mux.HandleFunc("/health", handlers.HealthCheck)

	// ── Auth ─────────────────────────────────────────────
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

	// ── Upload ───────────────────────────────────────────
	mux.HandleFunc("/upload", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodPost { http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return }
		middleware.OptionalAuth(uploadHandler.Upload)(w, r)
	})

	// ── Ads ──────────────────────────────────────────────
	mux.HandleFunc("/ads/stats", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		adHandler.GetStats(w, r)
	})
	mux.HandleFunc("/ads/calculate-price", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		adHandler.CalculatePricePreview(w, r)
	})
	mux.HandleFunc("/ads/mine", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		middleware.RequireAuth(adHandler.MyAds)(w, r)
	})
	mux.HandleFunc("/ads/live", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodGet { http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return }
		adHandler.GetLiveFeed(w, r)
	})
	mux.HandleFunc("/ads", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodGet:  adHandler.ListAds(w, r)
		case http.MethodPost: middleware.OptionalAuth(adHandler.CreateAd)(w, r)
		default:              http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/ads/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		path := strings.TrimPrefix(r.URL.Path, "/ads/")
		if strings.HasSuffix(path, "/status") && r.Method == http.MethodPatch {
			adHandler.UpdateAdStatus(w, r); return
		}
		switch r.Method {
		case http.MethodGet:
			if path == "" { adHandler.ListAds(w, r) } else { adHandler.GetAd(w, r) }
		case http.MethodPut:    middleware.OptionalAuth(adHandler.UpdateAd)(w, r)
		case http.MethodDelete: middleware.OptionalAuth(adHandler.DeleteAd)(w, r)
		default: http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// ── Notices ──────────────────────────────────────────
	mux.HandleFunc("/notices/mine", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodGet { http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return }
		middleware.RequireAuth(noticeHandler.MyNotices)(w, r)
	})
	mux.HandleFunc("/notices", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodGet:  noticeHandler.ListNotices(w, r)
		case http.MethodPost: middleware.OptionalAuth(noticeHandler.CreateNotice)(w, r)
		default:              http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})
	mux.HandleFunc("/notices/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		path := r.URL.Path
		if strings.Contains(path, "/approve") && r.Method == http.MethodPost {
			middleware.RequireAdmin(noticeHandler.AdminApprove)(w, r); return
		}
		if strings.Contains(path, "/reject") && r.Method == http.MethodPost {
			middleware.RequireAdmin(noticeHandler.AdminReject)(w, r); return
		}
		if r.Method == http.MethodGet { noticeHandler.GetNotice(w, r); return }
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	// ── Lost & Found (public) ────────────────────────────
	mux.HandleFunc("/lost-found", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodGet:  lfHandler.List(w, r)
		case http.MethodPost: lfHandler.Create(w, r)
		default:              http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// ── Sponsors (public) ────────────────────────────────
	mux.HandleFunc("/sponsors", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method == http.MethodGet { sponsorHandler.List(w, r); return }
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	// ── ADMIN — exact routes BEFORE trailing-slash catches ──

	// Admin notices (exact)
	mux.HandleFunc("/admin/notices", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodGet { http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return }
		middleware.RequireAdmin(noticeHandler.AdminListNotices)(w, r)
	})

	// Admin lost-found (exact)
	mux.HandleFunc("/admin/lost-found", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if r.Method != http.MethodGet { http.Error(w, "Method not allowed", http.StatusMethodNotAllowed); return }
		middleware.RequireAdmin(lfHandler.AdminList)(w, r)
	})

	// Admin sponsors (exact)
	mux.HandleFunc("/admin/sponsors", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodGet:  middleware.RequireAdmin(sponsorHandler.AdminList)(w, r)
		case http.MethodPost: middleware.RequireAdmin(sponsorHandler.AdminCreate)(w, r)
		default:              http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Admin lost-found actions (trailing slash)
	mux.HandleFunc("/admin/lost-found/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		path := r.URL.Path
		if strings.HasSuffix(path, "/approve") && r.Method == http.MethodPost {
			middleware.RequireAdmin(lfHandler.AdminApprove)(w, r); return
		}
		if strings.HasSuffix(path, "/reject") && r.Method == http.MethodPost {
			middleware.RequireAdmin(lfHandler.AdminReject)(w, r); return
		}
		http.Error(w, "Not found", http.StatusNotFound)
	})

	// Admin notices actions (trailing slash)
	mux.HandleFunc("/admin/notices/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		path := r.URL.Path
		if strings.HasSuffix(path, "/approve") && r.Method == http.MethodPost {
			middleware.RequireAdmin(noticeHandler.AdminApprove)(w, r); return
		}
		if strings.HasSuffix(path, "/reject") && r.Method == http.MethodPost {
			middleware.RequireAdmin(noticeHandler.AdminReject)(w, r); return
		}
		if r.Method == http.MethodPatch {
			middleware.RequireAdmin(noticeHandler.AdminEditNotice)(w, r); return
		}
		if r.Method == http.MethodGet {
			middleware.RequireAdmin(noticeHandler.AdminGetNotice)(w, r); return
		}
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	})

	// Admin sponsors/:id (trailing slash — PATCH, DELETE)
	mux.HandleFunc("/admin/sponsors/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		switch r.Method {
		case http.MethodPatch:  middleware.RequireAdmin(sponsorHandler.AdminUpdate)(w, r)
		case http.MethodDelete: middleware.RequireAdmin(sponsorHandler.AdminDelete)(w, r)
		default:                http.Error(w, "Not found", http.StatusNotFound)
		}
	})

	// Admin ads (trailing slash)
	mux.HandleFunc("/admin/ads/", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions { w.WriteHeader(http.StatusNoContent); return }
		if strings.HasSuffix(r.URL.Path, "/edit") && r.Method == http.MethodPatch {
			middleware.RequireAdmin(adHandler.AdminEditAd)(w, r); return
		}
		http.Error(w, "Not found", http.StatusNotFound)
	})

	return mux
}