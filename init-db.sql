-- PostgreSQL initialization script
-- This runs automatically when the database is first created
-- (only on fresh containers with empty data volumes)

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
