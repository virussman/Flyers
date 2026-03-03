package middleware

import (
	"context"
	"net/http"
	"os"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const UserIDKey contextKey = "user_id"
const UserRoleKey contextKey = "user_role"
const UserPhoneKey contextKey = "user_phone"

func getJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "flyers-secret-key-change-in-production"
	}
	return []byte(secret)
}

// RequireAuth — blocks unauthenticated requests
func RequireAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, phone := extractClaims(r)
		if userID == 0 {
			http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
			return
		}
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserRoleKey, role)
		ctx = context.WithValue(ctx, UserPhoneKey, phone)
		next(w, r.WithContext(ctx))
	}
}

// OptionalAuth — attaches user info if token present, continues either way
func OptionalAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		userID, role, phone := extractClaims(r)
		ctx := context.WithValue(r.Context(), UserIDKey, userID)
		ctx = context.WithValue(ctx, UserRoleKey, role)
		ctx = context.WithValue(ctx, UserPhoneKey, phone)
		next(w, r.WithContext(ctx))
	}
}

// RequireAdmin — blocks non-admin requests
func RequireAdmin(next http.HandlerFunc) http.HandlerFunc {
	return RequireAuth(func(w http.ResponseWriter, r *http.Request) {
		role, _ := r.Context().Value(UserRoleKey).(string)
		if role != "admin" {
			http.Error(w, `{"error":"Forbidden"}`, http.StatusForbidden)
			return
		}
		next(w, r)
	})
}

func extractClaims(r *http.Request) (int64, string, string) {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return 0, "", ""
	}
	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		return getJWTSecret(), nil
	})
	if err != nil || !token.Valid {
		return 0, "", ""
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return 0, "", ""
	}
	userID, _ := claims["user_id"].(float64)
	role, _ := claims["role"].(string)
	phone, _ := claims["phone"].(string)
	return int64(userID), role, phone
}

// GetUserID helper for handlers
func GetUserID(r *http.Request) int64 {
	id, _ := r.Context().Value(UserIDKey).(int64)
	return id
}

func GetUserRole(r *http.Request) string {
	role, _ := r.Context().Value(UserRoleKey).(string)
	return role
}