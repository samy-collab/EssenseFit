ALTER TABLE checkins
ADD COLUMN IF NOT EXISTS image_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS checkin_day DATE;

UPDATE checkins
SET checkin_day = (checked_in_at AT TIME ZONE 'UTC')::date
WHERE checkin_day IS NULL;

ALTER TABLE checkins
ALTER COLUMN checkin_day SET NOT NULL;

DROP INDEX IF EXISTS idx_checkins_user_day;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkins_user_day
ON checkins (user_id, checkin_day);
