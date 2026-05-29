ALTER TABLE project_files 
ADD CONSTRAINT project_files_project_id_path_unique 
UNIQUE (project_id, path);