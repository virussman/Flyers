-- ================================================================
-- FILE: backend/migrations/002_notices.sql

CREATE TYPE notice_type AS ENUM (
  'samvedana',        -- हार्दिक समवेदना   (large obituary)
  'shraddhanjali',    -- हार्दिक श्रद्धाञ्जली (small obituary)
  'bibaha',           -- विवाह शुभकामना
  'bratabandha',      -- व्रतबन्ध शुभकामना
  'graduation',       -- उत्तीर्ण शुभकामना
  'birth',            -- शिशु जन्म
  'business'          -- व्यापार शुभारम्भ
);

CREATE TYPE notice_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

CREATE TABLE IF NOT EXISTS notices (
  id                      BIGSERIAL       PRIMARY KEY,
  user_id                 BIGINT          REFERENCES users(id) ON DELETE SET NULL,

  notice_type             notice_type     NOT NULL,
  notice_status           notice_status   NOT NULL DEFAULT 'pending',
  display_size            VARCHAR(10)     NOT NULL DEFAULT 'small'
                          CHECK (display_size IN ('small','large')),

  -- Common (all types)
  title                   VARCHAR(200)    NOT NULL,
  body_text               TEXT            NOT NULL,
  published_by            VARCHAR(500)    NOT NULL,
  contact_phone           VARCHAR(15),

  -- Obituary fields
  deceased_name           VARCHAR(200),
  deceased_name_en        VARCHAR(200),
  deceased_title          VARCHAR(100),   -- e.g. "अ.प्रा." for military rank
  birth_date_bs           VARCHAR(40),
  death_date_bs           VARCHAR(40),
  kriya_text              TEXT,           -- क्रिया details free text
  funeral_location        TEXT,
  funeral_datetime        VARCHAR(100),
  photo_url               VARCHAR(500),

  -- Celebration fields
  person1_name            VARCHAR(200),
  person2_name            VARCHAR(200),   -- bride for bibaha
  person1_photo_url       VARCHAR(500),
  person2_photo_url       VARCHAR(500),
  event_date_bs           VARCHAR(40),
  event_date_ad           VARCHAR(60),
  event_time              VARCHAR(50),
  event_venue             TEXT,
  blessings_from          TEXT,           -- newline-separated family names

  -- Legal (admin-only, never returned in public API)
  advertiser_name         VARCHAR(200),
  advertiser_citizenship  VARCHAR(30),
  advertiser_id_doc_url   VARCHAR(500),
  death_cert_url          VARCHAR(500),
  advertiser_relationship VARCHAR(50),
  family_consent_agreed   BOOLEAN         NOT NULL DEFAULT FALSE,
  terms_agreed            BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Pricing
  total_cost              DECIMAL(10,2)   NOT NULL DEFAULT 0,
  is_premium              BOOLEAN         NOT NULL DEFAULT FALSE,

  -- Admin
  admin_note              TEXT,
  created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  expires_at              TIMESTAMPTZ     NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_notices_status  ON notices(notice_status);
CREATE INDEX idx_notices_type    ON notices(notice_type);
CREATE INDEX idx_notices_user    ON notices(user_id);
CREATE INDEX idx_notices_created ON notices(created_at DESC);