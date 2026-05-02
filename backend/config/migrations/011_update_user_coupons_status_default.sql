ALTER TABLE user_coupons
ALTER COLUMN status SET DEFAULT 'unused';

UPDATE user_coupons
SET status = 'unused'
WHERE status = 'available';
