-- Diagnostic script for search functionality
-- Run this against your production database to check and fix search setup

-- 1. Check if pg_trgm extension is installed
SELECT
    extname,
    extversion
FROM pg_extension
WHERE extname = 'pg_trgm';

-- If the above returns no rows, the extension is NOT installed.
-- Run the following to install it:

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Verify the extension works by testing similarity function
SELECT similarity('hello', 'helo') AS test_similarity;
-- Should return a number between 0 and 1 (approximately 0.5)

-- 3. Check if GIN indexes exist (optional, for performance)
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE indexname LIKE '%trgm%';

-- 4. Create GIN indexes if they don't exist (recommended for performance)
CREATE INDEX IF NOT EXISTS idx_note_title_trgm ON note USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_note_content_trgm ON note USING gin (content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_todo_title_trgm ON todo USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_todo_description_trgm ON todo USING gin (description gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tag_name_trgm ON tag USING gin (name gin_trgm_ops);

-- 5. Test search query directly (replace USER_ID with actual user id)
-- SELECT title, similarity(title, 'test') as score
-- FROM note
-- WHERE user_id = 'YOUR_USER_ID'
-- ORDER BY score DESC
-- LIMIT 5;
