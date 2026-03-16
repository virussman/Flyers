// FILE: backend/handlers/upload.go
// Handles photo uploads to Cloudinary
// Supports: obituary photo, person1/person2 photos for celebrations

package handlers

import (
	"bytes"
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

type UploadHandler struct{}

func NewUploadHandler() *UploadHandler {
	return &UploadHandler{}
}

type cloudinaryResponse struct {
	SecureURL string `json:"secure_url"`
	PublicID  string `json:"public_id"`
	Error     *struct {
		Message string `json:"message"`
	} `json:"error"`
}

// getCloudinaryConfig reads from env vars
func getCloudinaryConfig() (cloudName, apiKey, apiSecret string) {
	cloudName = os.Getenv("CLOUDINARY_CLOUD_NAME")
	apiKey    = os.Getenv("CLOUDINARY_API_KEY")
	apiSecret = os.Getenv("CLOUDINARY_API_SECRET")

	// Fallback: parse CLOUDINARY_URL=cloudinary://key:secret@cloudname
	if cloudName == "" {
		rawURL := os.Getenv("CLOUDINARY_URL")
		if rawURL != "" {
			if u, err := url.Parse(rawURL); err == nil {
				cloudName = u.Host
				apiKey    = u.User.Username()
				apiSecret, _ = u.User.Password()
			}
		}
	}
	return
}

// generateSignature creates Cloudinary upload signature
func generateSignature(params map[string]string, apiSecret string) string {
	// Sort keys
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Build param string
	parts := make([]string, 0, len(keys))
	for _, k := range keys {
		parts = append(parts, k+"="+params[k])
	}
	paramStr := strings.Join(parts, "&") + apiSecret

	h := sha1.New()
	h.Write([]byte(paramStr))
	return fmt.Sprintf("%x", h.Sum(nil))
}

// POST /upload
// Accepts: multipart/form-data with field "file"
// Optional field "folder" — e.g. "notices/obituary"
// Returns: { "url": "https://res.cloudinary.com/..." }
func (h *UploadHandler) Upload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "Method not allowed"})
		return
	}

	// 10MB max
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "File too large (max 10MB)"})
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": "No file provided"})
		return
	}
	defer file.Close()

	// Validate file type
	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		// Try to detect from extension
		name := strings.ToLower(header.Filename)
		if !strings.HasSuffix(name, ".jpg") && !strings.HasSuffix(name, ".jpeg") &&
			!strings.HasSuffix(name, ".png") && !strings.HasSuffix(name, ".webp") {
			respondJSON(w, http.StatusBadRequest, map[string]string{"error": "Only image files allowed (JPG, PNG, WebP)"})
			return
		}
	}

	cloudName, apiKey, apiSecret := getCloudinaryConfig()
	if cloudName == "" || apiKey == "" || apiSecret == "" {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Cloudinary not configured"})
		return
	}

	// Build upload params
	folder := r.FormValue("folder")
	if folder == "" {
		folder = "flyers/notices"
	}
	timestamp := strconv.FormatInt(time.Now().Unix(), 10)

	sigParams := map[string]string{
		"folder":    folder,
		"timestamp": timestamp,
	}
	signature := generateSignature(sigParams, apiSecret)

	// Build multipart request to Cloudinary
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)

	// Add file
	fw, err := mw.CreateFormFile("file", header.Filename)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to create upload"})
		return
	}
	if _, err = io.Copy(fw, file); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Failed to read file"})
		return
	}

	// Add signed params
	mw.WriteField("api_key", apiKey)
	mw.WriteField("timestamp", timestamp)
	mw.WriteField("signature", signature)
	mw.WriteField("folder", folder)
	mw.Close()

	// POST to Cloudinary
	uploadURL := fmt.Sprintf("https://api.cloudinary.com/v1_1/%s/image/upload", cloudName)
	req, err := http.NewRequest(http.MethodPost, uploadURL, &buf)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Upload request failed"})
		return
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Cloudinary unreachable"})
		return
	}
	defer resp.Body.Close()

	var cResp cloudinaryResponse
	if err := json.NewDecoder(resp.Body).Decode(&cResp); err != nil {
		respondJSON(w, http.StatusInternalServerError, map[string]string{"error": "Invalid Cloudinary response"})
		return
	}

	if cResp.Error != nil {
		respondJSON(w, http.StatusBadRequest, map[string]string{"error": cResp.Error.Message})
		return
	}

	respondJSON(w, http.StatusOK, map[string]string{
		"url":       cResp.SecureURL,
		"public_id": cResp.PublicID,
	})
}