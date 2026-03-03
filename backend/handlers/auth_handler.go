package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"flyers-backend/middleware"
	"flyers-backend/models"
	"flyers-backend/repositories"

	"github.com/golang-jwt/jwt/v5"
)

type AuthHandler struct {
	UserRepo *repositories.UserRepository
}

func NewAuthHandler(userRepo *repositories.UserRepository) *AuthHandler {
	return &AuthHandler{UserRepo: userRepo}
}

// POST /auth/send-otp
func (h *AuthHandler) SendOTP(w http.ResponseWriter, r *http.Request) {
	var req models.SendOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	// Validate Nepal phone number
	phone := req.Phone
	if len(phone) < 10 {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid phone number"})
		return
	}
	// Normalize: strip +977 or 977 prefix, keep 10 digits
	if len(phone) == 13 && phone[:3] == "+977" {
		phone = phone[3:]
	} else if len(phone) == 12 && phone[:2] == "977" {
		phone = phone[2:]  // fixed: changed [3:] to [2:]
	}

	code, err := h.UserRepo.CreateOTP(phone)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create OTP"})
		return
	}

	// In production: send via Sparrow SMS API
	// For now: log to console (dev mode)
	if os.Getenv("APP_ENV") == "production" {
		if err := sendSMS(phone, code); err != nil {
			log.Printf("SMS failed: %v", err)
		}
	} else {
		log.Printf("🔐 OTP for %s: %s", phone, code)
		fmt.Printf("\n╔═══════════════════════════╗\n║  OTP for %s: %s  ║\n╚═══════════════════════════╝\n\n", phone, code)
	}

	respondJSON(w, http.StatusOK, map[string]interface{}{
		"message": "OTP sent successfully",
		"phone":   phone,
		// In dev mode only, return OTP in response for easy testing
		"dev_otp": func() interface{} {
			if os.Getenv("APP_ENV") != "production" {
				return code
			}
			return nil
		}(),
	})
}

// POST /auth/verify-otp
func (h *AuthHandler) VerifyOTP(w http.ResponseWriter, r *http.Request) {
	var req models.VerifyOTPRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}

	if req.Phone == "" || req.Code == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Phone and code required"})
		return
	}

	valid, err := h.UserRepo.VerifyOTP(req.Phone, req.Code)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Verification failed"})
		return
	}
	if !valid {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid or expired OTP"})
		return
	}

	// Get or create user
	user, isNew, err := h.UserRepo.FindOrCreateByPhone(req.Phone)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "User creation failed"})
		return
	}

	// Save name if provided (first time)
	if isNew && req.Name != "" {
		h.UserRepo.UpdateName(user.ID, req.Name)
		user.Name = req.Name
	}

	// Mark verified
	h.UserRepo.MarkVerified(user.ID)
	user.IsVerified = true

	// Generate JWT
	token, err := generateJWT(user)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Token generation failed"})
		return
	}

	respondJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

// GET /auth/me — get current user from token
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	user, err := h.UserRepo.GetByID(userID)
	if err != nil || user == nil {
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "User not found"})
		return
	}
	respondJSON(w, http.StatusOK, user)
}

func generateJWT(user *models.User) (string, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "flyers-secret-key-change-in-production"
	}
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"phone":   user.Phone,
		"role":    user.Role,
		"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(), // 30 days
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

// sendSMS — Sparrow SMS integration (production)
func sendSMS(phone, code string) error {
	// TODO: integrate Sparrow SMS
	// POST https://api.sparrowsms.com/v2/sms/
	// token: your_sparrow_token
	// from: "Flyers"
	// to: "+977" + phone
	// text: "Your Flyers OTP is " + code + ". Valid for 10 minutes."
	log.Printf("SMS would be sent to %s with code %s", phone, code)
	return nil
}