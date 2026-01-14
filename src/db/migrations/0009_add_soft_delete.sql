-- Add indexes for soft delete support
-- These partial indexes efficiently filter non-deleted items
-- Note: The deleted_at columns are added via Drizzle migration 0006_complete_mattie_franklin.sql

CREATE INDEX IF NOT EXISTS idx_todo_deleted_at ON todo(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_note_deleted_at ON note(deleted_at) WHERE deleted_at IS NULL;
