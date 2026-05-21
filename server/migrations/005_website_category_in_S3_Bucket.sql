CREATE TABLE category_cache (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL UNIQUE,
    s3_key TEXT NOT NULL,
    file_count INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);