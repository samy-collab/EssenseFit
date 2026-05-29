ALTER TABLE users
    ADD COLUMN IF NOT EXISTS strava_athlete_id BIGINT,
    ADD COLUMN IF NOT EXISTS strava_access_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS strava_refresh_token VARCHAR(255),
    ADD COLUMN IF NOT EXISTS strava_token_expires_at BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS strava_scope VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_strava_athlete_id
    ON users (strava_athlete_id)
    WHERE strava_athlete_id IS NOT NULL;
