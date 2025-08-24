-- Add isPublished and publishedAt fields to goals table
ALTER TABLE goals ADD COLUMN isPublished BOOLEAN DEFAULT FALSE;
ALTER TABLE goals ADD COLUMN publishedAt DATETIME;

-- Create goal_shares table
CREATE TABLE goal_shares (
    id TEXT PRIMARY KEY,
    goalId TEXT NOT NULL,
    sharedById TEXT NOT NULL,
    sharedWithId TEXT NOT NULL,
    sharedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    message TEXT,
    FOREIGN KEY (goalId) REFERENCES goals(id) ON DELETE CASCADE,
    FOREIGN KEY (sharedById) REFERENCES users(id),
    FOREIGN KEY (sharedWithId) REFERENCES users(id),
    UNIQUE(goalId, sharedWithId)
);

