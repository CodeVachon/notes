-- Enable pg_trgm extension for fuzzy search with trigram matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for efficient trigram searches
CREATE INDEX IF NOT EXISTS idx_note_title_trgm ON note USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_note_content_trgm ON note USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_todo_title_trgm ON todo USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_todo_description_trgm ON todo USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tag_name_trgm ON tag USING gin (name gin_trgm_ops);
