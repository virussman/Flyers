-- 003_lost_found_table.sql  (corrected)
 
CREATE TABLE IF NOT EXISTS lost_found (
    id          BIGSERIAL PRIMARY KEY,
    type        VARCHAR(10)  NOT NULL CHECK (type IN ('lost','found')),
    category    VARCHAR(60)  NOT NULL DEFAULT '',
    title       VARCHAR(120) NOT NULL,
    description TEXT         NOT NULL,
    location    VARCHAR(80)  NOT NULL,
    date_lost   DATE,
    phone       VARCHAR(20)  NOT NULL,
    reward      VARCHAR(120) DEFAULT '',
    photo_url   TEXT         DEFAULT '',
    status      VARCHAR(20)  NOT NULL DEFAULT 'pending',
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
 
CREATE INDEX IF NOT EXISTS idx_lost_found_status_created
    ON lost_found(status, created_at DESC);
 