-- Add supervisorId field to departments table
ALTER TABLE departments ADD COLUMN supervisorId TEXT REFERENCES users(id);

-- Create index for better performance
CREATE INDEX idx_departments_supervisor_id ON departments(supervisorId);
