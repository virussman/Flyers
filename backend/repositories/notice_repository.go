package repositories

import (
	"database/sql"
	"fmt"
	"strings"

	"flyers-backend/models"
)

type NoticeRepository struct {
	DB *sql.DB
}

func NewNoticeRepository(db *sql.DB) *NoticeRepository {
	return &NoticeRepository{DB: db}
}

func ns(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func ni(i int64) interface{} {
	if i == 0 {
		return nil
	}
	return i
}

const noticeSelectCols = `
	id,
	COALESCE(user_id, 0),
	notice_type,
	notice_status,
	display_size,
	title,
	body_text,
	published_by,
	COALESCE(contact_phone, ''),
	COALESCE(deceased_name, ''),
	COALESCE(deceased_name_en, ''),
	COALESCE(deceased_title, ''),
	COALESCE(birth_date_bs, ''),
	COALESCE(death_date_bs, ''),
	COALESCE(kriya_text, ''),
	COALESCE(funeral_location, ''),
	COALESCE(funeral_datetime, ''),
	COALESCE(photo_url, ''),
	COALESCE(person1_name, ''),
	COALESCE(person2_name, ''),
	COALESCE(person1_photo_url, ''),
	COALESCE(person2_photo_url, ''),
	COALESCE(event_date_bs, ''),
	COALESCE(event_date_ad, ''),
	COALESCE(event_time, ''),
	COALESCE(event_venue, ''),
	COALESCE(blessings_from, ''),
	COALESCE(advertiser_name, ''),
	COALESCE(advertiser_citizenship, ''),
	COALESCE(advertiser_id_doc_url, ''),
	COALESCE(death_cert_url, ''),
	COALESCE(advertiser_relationship, ''),
	family_consent_agreed,
	terms_agreed,
	total_cost,
	is_premium,
	COALESCE(admin_note, ''),
	created_at,
	updated_at,
	expires_at`

type rowScanner interface {
	Scan(dest ...interface{}) error
}

func scanNotice(row rowScanner) (*models.Notice, error) {
	n := &models.Notice{}
	err := row.Scan(
		&n.ID, &n.UserID,
		&n.NoticeType, &n.Status, &n.DisplaySize,
		&n.Title, &n.BodyText, &n.PublishedBy, &n.ContactPhone,
		&n.DeceasedName, &n.DeceasedNameEn, &n.DeceasedTitle,
		&n.BirthDateBS, &n.DeathDateBS,
		&n.KriyaText, &n.FuneralLocation, &n.FuneralDatetime,
		&n.PhotoURL,
		&n.Person1Name, &n.Person2Name,
		&n.Person1PhotoURL, &n.Person2PhotoURL,
		&n.EventDateBS, &n.EventDateAD, &n.EventTime, &n.EventVenue,
		&n.BlessingsFrom,
		&n.AdvertiserName, &n.AdvertiserCitizenship,
		&n.AdvertiserIDDocURL, &n.DeathCertURL,
		&n.AdvertiserRelationship,
		&n.FamilyConsentAgreed, &n.TermsAgreed,
		&n.TotalCost, &n.IsPremium, &n.AdminNote,
		&n.CreatedAt, &n.UpdatedAt, &n.ExpiresAt,
	)
	return n, err
}

func (r *NoticeRepository) Create(n *models.Notice) error {
	return r.DB.QueryRow(`
		INSERT INTO notices (
			user_id, notice_type, display_size,
			title, body_text, published_by, contact_phone,
			deceased_name, deceased_name_en, deceased_title,
			birth_date_bs, death_date_bs, kriya_text,
			funeral_location, funeral_datetime, photo_url,
			person1_name, person2_name, person1_photo_url, person2_photo_url,
			event_date_bs, event_date_ad, event_time, event_venue, blessings_from,
			advertiser_name, advertiser_citizenship, advertiser_id_doc_url,
			death_cert_url, advertiser_relationship,
			family_consent_agreed, terms_agreed,
			total_cost, is_premium
		) VALUES (
			$1,$2,$3,
			$4,$5,$6,$7,
			$8,$9,$10,
			$11,$12,$13,
			$14,$15,$16,
			$17,$18,$19,$20,
			$21,$22,$23,$24,$25,
			$26,$27,$28,
			$29,$30,
			$31,$32,
			$33,$34
		) RETURNING id, created_at, updated_at, expires_at`,
		ni(n.UserID), string(n.NoticeType), n.DisplaySize,
		n.Title, n.BodyText, n.PublishedBy, ns(n.ContactPhone),
		ns(n.DeceasedName), ns(n.DeceasedNameEn), ns(n.DeceasedTitle),
		ns(n.BirthDateBS), ns(n.DeathDateBS), ns(n.KriyaText),
		ns(n.FuneralLocation), ns(n.FuneralDatetime), ns(n.PhotoURL),
		ns(n.Person1Name), ns(n.Person2Name), ns(n.Person1PhotoURL), ns(n.Person2PhotoURL),
		ns(n.EventDateBS), ns(n.EventDateAD), ns(n.EventTime), ns(n.EventVenue), ns(n.BlessingsFrom),
		ns(n.AdvertiserName), ns(n.AdvertiserCitizenship), ns(n.AdvertiserIDDocURL),
		ns(n.DeathCertURL), ns(n.AdvertiserRelationship),
		n.FamilyConsentAgreed, n.TermsAgreed,
		n.TotalCost, n.IsPremium,
	).Scan(&n.ID, &n.CreatedAt, &n.UpdatedAt, &n.ExpiresAt)
	
}

func (r *NoticeRepository) GetByID(id int64) (*models.Notice, error) {
	row := r.DB.QueryRow(
		`SELECT `+noticeSelectCols+` FROM notices WHERE id = $1`, id,
	)
	n, err := scanNotice(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return n, err
}

func (r *NoticeRepository) List(filter models.NoticeFilter) ([]models.Notice, int, error) {
	conds := []string{}
	args  := []interface{}{}
	i := 1

	if filter.Status != "" {
		conds = append(conds, fmt.Sprintf("notice_status = $%d", i))
		args = append(args, string(filter.Status))
		i++
	} else {
		conds = append(conds, "notice_status = 'approved'")
	}

	if filter.NoticeType != "" {
		conds = append(conds, fmt.Sprintf("notice_type = $%d", i))
		args = append(args, string(filter.NoticeType))
		i++
	}
	if filter.IsPremium != nil {
		conds = append(conds, fmt.Sprintf("is_premium = $%d", i))
		args = append(args, *filter.IsPremium)
		i++
	}

	where := ""
	if len(conds) > 0 {
		where = "WHERE " + strings.Join(conds, " AND ")
	}

	// Count uses same args (no limit/offset)
	var total int
	countArgs := make([]interface{}, len(args))
	copy(countArgs, args)
	r.DB.QueryRow("SELECT COUNT(*) FROM notices "+where, countArgs...).Scan(&total)

	if filter.Page < 1  { filter.Page = 1 }
	if filter.Limit < 1 || filter.Limit > 100 { filter.Limit = 20 }
	offset := (filter.Page - 1) * filter.Limit

	// Add limit and offset as NEW args AFTER count query
	queryArgs := make([]interface{}, len(args))
	copy(queryArgs, args)
	queryArgs = append(queryArgs, filter.Limit, offset)

	query := fmt.Sprintf(
		`SELECT `+noticeSelectCols+`
		FROM notices %s
		ORDER BY is_premium DESC, created_at DESC
		LIMIT $%d OFFSET $%d`,
		where, i, i+1,
	)

	rows, err := r.DB.Query(query, queryArgs...)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	out := []models.Notice{}
	for rows.Next() {
		n, err := scanNotice(rows)
		if err == nil { out = append(out, *n) }
	}
	return out, total, nil
}

func (r *NoticeRepository) ListByUser(userID int64, page, limit int) ([]models.Notice, int, error) {
	var total int
	r.DB.QueryRow(`SELECT COUNT(*) FROM notices WHERE user_id = $1`, userID).Scan(&total)

	if page < 1 { page = 1 }
	if limit < 1 { limit = 20 }

	rows, err := r.DB.Query(
		`SELECT `+noticeSelectCols+`
		FROM notices WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3`,
		userID, limit, (page-1)*limit,
	)
	if err != nil { return nil, 0, err }
	defer rows.Close()

	out := []models.Notice{}
	for rows.Next() {
		n, err := scanNotice(rows)
		if err == nil { out = append(out, *n) }
	}
	return out, total, nil
}

func (r *NoticeRepository) UpdateStatus(id int64, status models.NoticeStatus, note string) error {
	_, err := r.DB.Exec(
		`UPDATE notices SET notice_status = $1, admin_note = $2, updated_at = NOW() WHERE id = $3`,
		string(status), ns(note), id,
	)
	return err
}

// Update — admin edits notice content, status stays unchanged
func (r *NoticeRepository) Update(id int64, req models.UpdateNoticeRequest) error {
	_, err := r.DB.Exec(`
		UPDATE notices SET
			title            = $1,
			body_text        = $2,
			published_by     = $3,
			contact_phone    = $4,
			deceased_name    = $5,
			deceased_name_en = $6,
			deceased_title   = $7,
			birth_date_bs    = $8,
			death_date_bs    = $9,
			kriya_text       = $10,
			funeral_location = $11,
			funeral_datetime = $12,
			photo_url        = $13,
			person1_name     = $14,
			person2_name     = $15,
			person1_photo_url= $16,
			person2_photo_url= $17,
			event_date_bs    = $18,
			event_date_ad    = $19,
			event_time       = $20,
			event_venue      = $21,
			blessings_from   = $22,
			admin_note       = $23,
			updated_at       = NOW()
		WHERE id = $24`,
		req.Title, req.BodyText, req.PublishedBy, ns(req.ContactPhone),
		ns(req.DeceasedName), ns(req.DeceasedNameEn), ns(req.DeceasedTitle),
		ns(req.BirthDateBS), ns(req.DeathDateBS), ns(req.KriyaText),
		ns(req.FuneralLocation), ns(req.FuneralDatetime), ns(req.PhotoURL),
		ns(req.Person1Name), ns(req.Person2Name),
		ns(req.Person1PhotoURL), ns(req.Person2PhotoURL),
		ns(req.EventDateBS), ns(req.EventDateAD), ns(req.EventTime),
		ns(req.EventVenue), ns(req.BlessingsFrom),
		ns(req.AdminNote),
		id,
	)
	return err
}