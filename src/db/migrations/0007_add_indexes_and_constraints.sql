-- Add foreign key indexes for better query performance
-- These indexes speed up JOINs and foreign key lookups

-- Comment table indexes
CREATE INDEX IF NOT EXISTS idx_comment_todo_id ON comment(todo_id);
CREATE INDEX IF NOT EXISTS idx_comment_note_id ON comment(note_id);

-- Project assignment table indexes
CREATE INDEX IF NOT EXISTS idx_project_assignment_todo_id ON project_assignment(todo_id);
CREATE INDEX IF NOT EXISTS idx_project_assignment_note_id ON project_assignment(note_id);
CREATE INDEX IF NOT EXISTS idx_project_assignment_comment_id ON project_assignment(comment_id);

-- Tag mention table indexes
CREATE INDEX IF NOT EXISTS idx_tag_mention_todo_id ON tag_mention(todo_id);
CREATE INDEX IF NOT EXISTS idx_tag_mention_note_id ON tag_mention(note_id);
CREATE INDEX IF NOT EXISTS idx_tag_mention_comment_id ON tag_mention(comment_id);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_todo_user_date ON todo(user_id, date);
CREATE INDEX IF NOT EXISTS idx_note_user_date ON note(user_id, date);
CREATE INDEX IF NOT EXISTS idx_note_user_folder ON note(user_id, folder_id);

-- Add constraint to ensure comments have exactly one parent (todo OR note, not both)
ALTER TABLE comment ADD CONSTRAINT comment_parent_required
CHECK (
    (CASE WHEN todo_id IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN note_id IS NOT NULL THEN 1 ELSE 0 END) = 1
);

-- Add date format validation constraints
ALTER TABLE todo ADD CONSTRAINT todo_date_format
CHECK (date ~ '^\d{4}-\d{2}-\d{2}$');

ALTER TABLE note ADD CONSTRAINT note_date_format
CHECK (date IS NULL OR date ~ '^\d{4}-\d{2}-\d{2}$');
