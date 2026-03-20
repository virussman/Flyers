package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"

	"flyers-backend/middleware"
	"flyers-backend/models"
	"flyers-backend/repositories"

	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/api/idtoken"
)

type AuthHandler struct {
	UserRepo *repositories.UserRepository
}

func NewAuthHandler(userRepo *repositories.UserRepository) *AuthHandler {
	return &AuthHandler{UserRepo: userRepo}
}

func (h *AuthHandler) GoogleLogin(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IDToken string `json:"id_token"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("ERROR: decode body: %v", err)
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Invalid JSON"})
		return
	}
	if req.IDToken == "" {
		log.Printf("ERROR: empty id_token")
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "id_token required"})
		return
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	log.Printf("DEBUG: verifying token with clientID: %s", clientID)

	payload, err := idtoken.Validate(context.Background(), req.IDToken, clientID)
	if err != nil {
		log.Printf("ERROR: token validation failed: %v", err)
		respondJSON(w, http.StatusUnauthorized, map[string]string{"error": "Invalid Google token"})
		return
	}

	email, _ := payload.Claims["email"].(string)
	name, _ := payload.Claims["name"].(string)
	googleID, _ := payload.Claims["sub"].(string)
	log.Printf("DEBUG: Google user - email: %s, name: %s, googleID: %s", email, name, googleID)

	if email == "" {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Email not provided by Google"})
		return
	}

	user, err := h.UserRepo.FindOrCreateByGoogle(googleID, email, name)
	if err != nil {
		log.Printf("ERROR: FindOrCreateByGoogle failed: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "User creation failed"})
		return
	}
	log.Printf("DEBUG: user saved - id: %d, email: %s", user.ID, user.Email)

	token, err := generateJWT(user)
	if err != nil {
		log.Printf("ERROR: JWT generation failed: %v", err)
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Token generation failed"})
		return
	}

	respondJSON(w, http.StatusOK, models.AuthResponse{
		Token: token,
		User:  *user,
	})
}

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
		"email":   user.Email,
		"role":    user.Role,
		"exp":     time.Now().Add(30 * 24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}
