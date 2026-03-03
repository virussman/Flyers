package repositories

import (
	"database/sql"
	"flyers-backend/models"
	"math/rand"
	"time"
	"fmt"
)

type UserRepository struct {
	DB *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{DB: db}
}

// FindOrCreateByPhone — gets existing user or creates new one
func (r *UserRepository) FindOrCreateByPhone(phone string) (*models.User, bool, error) {
	user := &models.User{}
	err := r.DB.QueryRow(
		`SELECT id, phone, name, COALESCE(email,''), role, is_verified, created_at, updated_at
		 FROM users WHERE phone = $1`, phone,
	).Scan(&user.ID, &user.Phone, &user.Name, &user.Email,
		&user.Role, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)

	if err == sql.ErrNoRows {
		// Create new user
		err = r.DB.QueryRow(
			`INSERT INTO users (phone) VALUES ($1)
			 RETURNING id, phone, name, COALESCE(email,''), role, is_verified, created_at, updated_at`,
			phone,
		).Scan(&user.ID, &user.Phone, &user.Name, &user.Email,
			&user.Role, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)
		return user, true, err // true = newly created
	}
	return user, false, err
}

func (r *UserRepository) GetByID(id int64) (*models.User, error) {
	user := &models.User{}
	err := r.DB.QueryRow(
		`SELECT id, phone, name, COALESCE(email,''), role, is_verified, created_at, updated_at
		 FROM users WHERE id = $1`, id,
	).Scan(&user.ID, &user.Phone, &user.Name, &user.Email,
		&user.Role, &user.IsVerified, &user.CreatedAt, &user.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return user, err
}

func (r *UserRepository) UpdateName(id int64, name string) error {
	_, err := r.DB.Exec(
		`UPDATE users SET name = $1, updated_at = NOW() WHERE id = $2`, name, id)
	return err
}

func (r *UserRepository) MarkVerified(id int64) error {
	_, err := r.DB.Exec(
		`UPDATE users SET is_verified = TRUE, updated_at = NOW() WHERE id = $1`, id)
	return err
}

// CreateOTP generates and stores a 6-digit OTP
func (r *UserRepository) CreateOTP(phone string) (string, error) {
	// Invalidate old OTPs for this phone
	r.DB.Exec(`UPDATE otps SET used = TRUE WHERE phone = $1 AND used = FALSE`, phone)

	// Generate 6-digit code
	rand.Seed(time.Now().UnixNano())
	code := fmt.Sprintf("%06d", rand.Intn(1000000))

	_, err := r.DB.Exec(
		`INSERT INTO otps (phone, code, expires_at) VALUES ($1, $2, NOW() + INTERVAL '10 minutes')`,
		phone, code,
	)
	return code, err
}

// VerifyOTP checks code and marks it used
func (r *UserRepository) VerifyOTP(phone, code string) (bool, error) {
	var id int64
	err := r.DB.QueryRow(
		`SELECT id FROM otps
		 WHERE phone = $1 AND code = $2
		   AND used = FALSE AND expires_at > NOW()
		 ORDER BY created_at DESC LIMIT 1`,
		phone, code,
	).Scan(&id)

	if err == sql.ErrNoRows {
		return false, nil // invalid or expired
	}
	if err != nil {
		return false, err
	}

	// Mark used
	r.DB.Exec(`UPDATE otps SET used = TRUE WHERE id = $1`, id)
	return true, nil
}