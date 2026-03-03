package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"flyers-backend/models"
	"github.com/lib/pq"
)

type AdRepository struct {
	DB *sql.DB
}

func NewAdRepository(db *sql.DB) *AdRepository {
	return &AdRepository{DB: db}
}

// Create inserts a new ad (FIXED: proper parameter count)
func (r *AdRepository) Create(ad *models.Ad) error {
	query := `
		INSERT INTO ads (user_id, title, description, category, price, word_count, total_cost,
			contact_phone, contact_email, location, is_premium, image_urls, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, created_at, updated_at, expires_at
	`

	err := r.DB.QueryRow(
		query,
		ad.UserID,           // $1
		ad.Title,            // $2
		ad.Description,      // $3
		ad.Category,         // $4
		ad.Price,            // $5
		ad.WordCount,        // $6
		ad.TotalCost,        // $7
		ad.ContactPhone,     // $8
		ad.ContactEmail,     // $9
		ad.Location,         // $10
		ad.IsPremium,        // $11
		pq.Array(ad.ImageURLs), // $12
		ad.Status,           // $13
	).Scan(&ad.ID, &ad.CreatedAt, &ad.UpdatedAt, &ad.ExpiresAt)

	return err
}

// GetByID retrieves single ad (with user_id support)
func (r *AdRepository) GetByID(id int64) (*models.Ad, error) {
	query := `
		SELECT id, COALESCE(user_id, 0), title, description, category, price, word_count, total_cost,
			contact_phone, contact_email, location, status, is_premium, image_urls,
			created_at, updated_at, expires_at
		FROM ads WHERE id = $1
	`

	ad := &models.Ad{}
	var imageURLs []string

	err := r.DB.QueryRow(query, id).Scan(
		&ad.ID, &ad.UserID, &ad.Title, &ad.Description, &ad.Category, &ad.Price,
		&ad.WordCount, &ad.TotalCost, &ad.ContactPhone, &ad.ContactEmail,
		&ad.Location, &ad.Status, &ad.IsPremium, pq.Array(&imageURLs),
		&ad.CreatedAt, &ad.UpdatedAt, &ad.ExpiresAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	ad.ImageURLs = imageURLs
	return ad, nil
}

// List retrieves ads with filtering and pagination (with user_id support)
func (r *AdRepository) List(filter models.AdFilter) ([]models.Ad, int, error) {
	ads := make([]models.Ad, 0)

	whereClause := []string{"1=1"}
	args := []interface{}{}
	argCount := 0

	if filter.Category != "" {
		argCount++
		whereClause = append(whereClause, fmt.Sprintf("category = $%d", argCount))
		args = append(args, filter.Category)
	}
	if filter.Location != "" {
		argCount++
		whereClause = append(whereClause, fmt.Sprintf("location ILIKE $%d", argCount))
		args = append(args, "%"+filter.Location+"%")
	}
	if filter.Status != "" {
		argCount++
		whereClause = append(whereClause, fmt.Sprintf("status = $%d", argCount))
		args = append(args, filter.Status)
	} else {
		whereClause = append(whereClause, "status = 'approved'")
	}

	countQuery := "SELECT COUNT(*) FROM ads WHERE " + strings.Join(whereClause, " AND ")
	var total int
	err := r.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return ads, 0, err
	}

	if filter.Page < 1 {
		filter.Page = 1
	}
	if filter.Limit < 1 || filter.Limit > 100 {
		filter.Limit = 20
	}
	offset := (filter.Page - 1) * filter.Limit

	query := fmt.Sprintf(`
		SELECT id, COALESCE(user_id, 0), title, description, category, price, word_count, total_cost,
			contact_phone, contact_email, location, status, is_premium, image_urls,
			created_at, updated_at, expires_at
		FROM ads
		WHERE %s
		ORDER BY is_premium DESC, created_at DESC
		LIMIT $%d OFFSET $%d
	`, strings.Join(whereClause, " AND "), argCount+1, argCount+2)

	args = append(args, filter.Limit, offset)

	rows, err := r.DB.Query(query, args...)
	if err != nil {
		return ads, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		ad := models.Ad{}
		var imageURLs []string

		err := rows.Scan(
			&ad.ID, &ad.UserID, &ad.Title, &ad.Description, &ad.Category, &ad.Price,
			&ad.WordCount, &ad.TotalCost, &ad.ContactPhone, &ad.ContactEmail,
			&ad.Location, &ad.Status, &ad.IsPremium, pq.Array(&imageURLs),
			&ad.CreatedAt, &ad.UpdatedAt, &ad.ExpiresAt,
		)
		if err != nil {
			return ads, 0, err
		}
		ad.ImageURLs = imageURLs
		ads = append(ads, ad)
	}

	if err = rows.Err(); err != nil {
		return ads, 0, err
	}

	return ads, total, nil
}

// GetByUserID returns ads created by a specific user
func (r *AdRepository) GetByUserID(userID int64) ([]models.Ad, error) {
	query := `
		SELECT id, title, description, category, price, word_count,
		       total_cost, contact_phone, contact_email, location,
		       status, is_premium, image_urls, created_at, user_id
		FROM ads
		WHERE user_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var ads []models.Ad

	for rows.Next() {
		var ad models.Ad
		err := rows.Scan(
			&ad.ID,
			&ad.Title,
			&ad.Description,
			&ad.Category,
			&ad.Price,
			&ad.WordCount,
			&ad.TotalCost,
			&ad.ContactPhone,
			&ad.ContactEmail,
			&ad.Location,
			&ad.Status,
			&ad.IsPremium,
			&ad.ImageURLs,
			&ad.CreatedAt,
			&ad.UserID,
		)
		if err != nil {
			return nil, err
		}
		ads = append(ads, ad)
	}

	return ads, nil
}

// ✅ NEW: ListByUser returns all ads belonging to a specific user
func (r *AdRepository) ListByUser(userID int64, page, limit int) ([]models.Ad, int, error) {
	ads := make([]models.Ad, 0)

	var total int
	err := r.DB.QueryRow(`SELECT COUNT(*) FROM ads WHERE user_id = $1`, userID).Scan(&total)
	if err != nil {
		return ads, 0, err
	}

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit

	rows, err := r.DB.Query(`
		SELECT id, COALESCE(user_id, 0), title, description, category, price, word_count, total_cost,
		       contact_phone, contact_email, location, status, is_premium, image_urls,
		       created_at, updated_at, expires_at
		FROM ads
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, limit, offset)
	if err != nil {
		return ads, 0, err
	}
	defer rows.Close()

	for rows.Next() {
		ad := models.Ad{}
		var imageURLs []string
		err := rows.Scan(
			&ad.ID, &ad.UserID, &ad.Title, &ad.Description, &ad.Category, &ad.Price,
			&ad.WordCount, &ad.TotalCost, &ad.ContactPhone, &ad.ContactEmail,
			&ad.Location, &ad.Status, &ad.IsPremium, pq.Array(&imageURLs),
			&ad.CreatedAt, &ad.UpdatedAt, &ad.ExpiresAt,
		)
		if err != nil {
			continue
		}
		ad.ImageURLs = imageURLs
		ads = append(ads, ad)
	}
	return ads, total, nil
}

// Update modifies an ad
func (r *AdRepository) Update(id int64, req models.UpdateAdRequest, newCost float64, newWordCount int) error {
	sets := []string{}
	args := []interface{}{}
	argCount := 0

	if req.Title != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("title = $%d", argCount))
		args = append(args, req.Title)
	}
	if req.Description != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("description = $%d", argCount))
		args = append(args, req.Description)
	}
	if req.Category != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("category = $%d", argCount))
		args = append(args, req.Category)
	}
	if req.ContactPhone != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("contact_phone = $%d", argCount))
		args = append(args, req.ContactPhone)
	}
	if req.ContactEmail != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("contact_email = $%d", argCount))
		args = append(args, req.ContactEmail)
	}
	if req.Location != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("location = $%d", argCount))
		args = append(args, req.Location)
	}
	if req.Status != "" {
		argCount++
		sets = append(sets, fmt.Sprintf("status = $%d", argCount))
		args = append(args, req.Status)
	}
	if req.IsPremium != nil {
		argCount++
		sets = append(sets, fmt.Sprintf("is_premium = $%d", argCount))
		args = append(args, *req.IsPremium)
	}
	if req.ImageURLs != nil {
		argCount++
		sets = append(sets, fmt.Sprintf("image_urls = $%d", argCount))
		args = append(args, pq.Array(req.ImageURLs))
	}

	argCount++
	sets = append(sets, fmt.Sprintf("word_count = $%d", argCount))
	args = append(args, newWordCount)

	argCount++
	sets = append(sets, fmt.Sprintf("total_cost = $%d", argCount))
	args = append(args, newCost)

	sets = append(sets, "updated_at = CURRENT_TIMESTAMP")

	argCount++
	args = append(args, id)

	query := fmt.Sprintf("UPDATE ads SET %s WHERE id = $%d",
		strings.Join(sets, ", "), argCount)

	_, err := r.DB.Exec(query, args...)
	return err
}

// Delete removes an ad
func (r *AdRepository) Delete(id int64) error {
	_, err := r.DB.Exec("DELETE FROM ads WHERE id = $1", id)
	return err
}

// UpdateStatus updates only the status field (admin use)
func (r *AdRepository) UpdateStatus(id int64, status models.AdStatus) error {
	query := `UPDATE ads SET status = $1, updated_at = NOW() WHERE id = $2`
	result, err := r.DB.Exec(query, status, id)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

// GetStats returns dashboard statistics
func (r *AdRepository) GetStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	var totalCount int
	err := r.DB.QueryRow(`SELECT COUNT(*) FROM ads`).Scan(&totalCount)
	if err != nil {
		return nil, err
	}
	stats["total_ads"] = totalCount

	rows, err := r.DB.Query(`SELECT status, COUNT(*) FROM ads GROUP BY status`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	statusCounts := make(map[string]int)
	for rows.Next() {
		var status string
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			continue
		}
		statusCounts[status] = count
	}
	stats["by_status"] = statusCounts

	var premiumCount int
	err = r.DB.QueryRow(`SELECT COUNT(*) FROM ads WHERE is_premium = true`).Scan(&premiumCount)
	if err != nil {
		return nil, err
	}
	stats["premium_ads"] = premiumCount

	var totalRevenue float64
	err = r.DB.QueryRow(`
		SELECT COALESCE(SUM(total_cost), 0) 
		FROM ads 
		WHERE status IN ('approved', 'published')
	`).Scan(&totalRevenue)
	if err != nil {
		return nil, err
	}
	stats["total_revenue"] = totalRevenue

	return stats, nil
}