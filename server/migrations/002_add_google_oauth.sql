-- Add OAuth support

ALTER TABLE users
ADD COLUMN google_id TEXT UNIQUE,
ADD COLUMN username TEXT,
ADD COLUMN img TEXT;

-- Allow password to be nullable (for Google users)
ALTER TABLE users
ALTER COLUMN password DROP NOT NULL;