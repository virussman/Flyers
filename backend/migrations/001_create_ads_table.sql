-- ============================================
-- Users & Authentication Tables
-- ============================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    phone       VARCHAR(15)  UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL DEFAULT '',
    email       VARCHAR(255),
    role        VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_verified BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- OTP table for phone verification
CREATE TABLE IF NOT EXISTS otps (
    id         BIGSERIAL   PRIMARY KEY,
    phone      VARCHAR(15) NOT NULL,
    code       VARCHAR(6)  NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '10 minutes'),
    used       BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otps_phone    ON otps(phone);
CREATE INDEX IF NOT EXISTS idx_otps_expires  ON otps(expires_at);

-- ============================================
-- Ads Table (Safe for existing data)
-- ============================================

-- Add user_id first (safe to run multiple times)
ALTER TABLE ads ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Create table only if not exists (for fresh installs)
CREATE TABLE IF NOT EXISTS ads (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC(10,2) DEFAULT 0,
    word_count INTEGER NOT NULL,
    total_cost NUMERIC(10,2) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    contact_email VARCHAR(100),
    location VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    is_premium BOOLEAN DEFAULT FALSE,
    image_urls TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

-- Add user_id if table already existed without it
ALTER TABLE ads ADD COLUMN IF NOT EXISTS user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

-- Indexes (all use IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_ads_category ON ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_location ON ads(location);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_is_premium ON ads(is_premium);
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);

-- Table comment
COMMENT ON TABLE ads IS 'Classified advertisements (Bargikrit Bigyapan)';