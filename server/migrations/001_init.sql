-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- PROJECTS table
CREATE TABLE IF NOT EXISTS proje (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stack TEXT NOT NULL,
  status TEXT NOT NULL,

  owner_id UUID NOT NULL,
  CONSTRAINT fk_owner
    FOREIGN KEY (owner_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
