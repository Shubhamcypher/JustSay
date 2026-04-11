-- Create project_members table
CREATE TABLE IF NOT EXISTS project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'viewer',

  created_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_pm_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_pm_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE (project_id, user_id)
);

-- Create project_stars table
CREATE TABLE IF NOT EXISTS project_stars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  project_id UUID NOT NULL,
  user_id UUID NOT NULL,

  created_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_ps_project
    FOREIGN KEY (project_id)
    REFERENCES projects(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_ps_user
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE,

  UNIQUE (project_id, user_id)
);