-- 004_sponsors_table.sql
CREATE TABLE IF NOT EXISTS sponsors (
    id           BIGSERIAL PRIMARY KEY,
    name         VARCHAR(120) NOT NULL,
    category     VARCHAR(60)  NOT NULL DEFAULT '',
    location     VARCHAR(80)  NOT NULL DEFAULT '',
    website_url  TEXT         DEFAULT '',
    logo_url     TEXT         DEFAULT '',
    tier         VARCHAR(20)  NOT NULL DEFAULT 'Featured' CHECK (tier IN ('Gold','Featured')),
    status       VARCHAR(20)  NOT NULL DEFAULT 'active'   CHECK (status IN ('active','inactive')),
    display_order INT         NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_status_order ON sponsors(status, display_order ASC);

-- seed a couple of examples (optional)
-- INSERT INTO sponsors (name, category, location, tier) VALUES ('Example Co', 'Services', 'Kathmandu', 'Gold');

-- Add offer fields to sponsors table
ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS tagline      VARCHAR(120) DEFAULT '',
  ADD COLUMN IF NOT EXISTS offer_text   VARCHAR(200) DEFAULT '',
  ADD COLUMN IF NOT EXISTS offer_badge  VARCHAR(40)  DEFAULT '';
-- offer_badge: short label like "SALE", "20% OFF", "NEW", "LIMITED" etc.