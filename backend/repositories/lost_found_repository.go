package repositories

import (
	"database/sql"
	"flyers-backend/models"
)

type LostFoundRepository struct {
	DB *sql.DB
}

func NewLostFoundRepository(db *sql.DB) *LostFoundRepository {
	return &LostFoundRepository{DB: db}
}

// Create — new submissions start as 'pending'
func (r *LostFoundRepository) Create(req models.CreateLostFoundRequest) (*models.LostFoundItem, error) {
	item := &models.LostFoundItem{}
	err := r.DB.QueryRow(`
		INSERT INTO lost_found
		  (type, category, title, description, location, date_lost, phone, reward, photo_url, status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending')
		RETURNING id, type, category, title, description, location, date_lost,
		          phone, reward, photo_url, status, created_at
	`,
		req.Type, req.Category, req.Title, req.Description,
		req.Location, req.DateLost, req.Phone,
		req.Reward, req.PhotoURL,
	).Scan(
		&item.ID, &item.Type, &item.Category, &item.Title, &item.Description,
		&item.Location, &item.DateLost, &item.Phone, &item.Reward,
		&item.PhotoURL, &item.Status, &item.CreatedAt,
	)
	return item, err
}

// List — public, only active items
func (r *LostFoundRepository) List(limit int) ([]models.LostFoundItem, error) {
	if limit <= 0 {
		limit = 8
	}
	rows, err := r.DB.Query(`
		SELECT id, type, category, title, description, location, date_lost,
		       phone, reward, photo_url, status, created_at
		FROM lost_found
		WHERE status = 'active'
		ORDER BY created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItems(rows)
}

// AdminList — all items filtered by status
func (r *LostFoundRepository) AdminList(status string, limit int) ([]models.LostFoundItem, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := r.DB.Query(`
		SELECT id, type, category, title, description, location, date_lost,
		       phone, reward, photo_url, status, created_at
		FROM lost_found
		WHERE status = $1
		ORDER BY created_at DESC
		LIMIT $2
	`, status, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanItems(rows)
}

// AdminApprove — set status to 'active'
func (r *LostFoundRepository) AdminApprove(id int64) error {
	_, err := r.DB.Exec(`
		UPDATE lost_found SET status = 'active', updated_at = NOW() WHERE id = $1
	`, id)
	return err
}

// AdminReject — set status to 'rejected'
func (r *LostFoundRepository) AdminReject(id int64) error {
	_, err := r.DB.Exec(`
		UPDATE lost_found SET status = 'rejected', updated_at = NOW() WHERE id = $1
	`, id)
	return err
}

// GetByID — fetch a single report
func (r *LostFoundRepository) GetByID(id int64) (*models.LostFoundItem, error) {
	item := &models.LostFoundItem{}
	err := r.DB.QueryRow(`
		SELECT id, type, category, title, description, location, date_lost,
		       phone, reward, photo_url, status, created_at
		FROM lost_found WHERE id = $1
	`, id).Scan(
		&item.ID, &item.Type, &item.Category, &item.Title, &item.Description,
		&item.Location, &item.DateLost, &item.Phone, &item.Reward,
		&item.PhotoURL, &item.Status, &item.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return item, nil
}

// helper
func scanItems(rows *sql.Rows) ([]models.LostFoundItem, error) {
	items := make([]models.LostFoundItem, 0)
	for rows.Next() {
		i := models.LostFoundItem{}
		err := rows.Scan(
			&i.ID, &i.Type, &i.Category, &i.Title, &i.Description,
			&i.Location, &i.DateLost, &i.Phone, &i.Reward,
			&i.PhotoURL, &i.Status, &i.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	return items, nil
}