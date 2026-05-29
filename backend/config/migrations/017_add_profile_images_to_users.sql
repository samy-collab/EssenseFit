ALTER TABLE users
    ADD COLUMN IF NOT EXISTS profile_image_url VARCHAR(500),
    ADD COLUMN IF NOT EXISTS strava_profile_image_url VARCHAR(500);
