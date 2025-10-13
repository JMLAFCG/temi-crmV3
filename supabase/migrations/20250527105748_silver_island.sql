/*
  # Add photos column to projects table

  1. Changes
    - Add `photos` column to `projects` table as JSONB array
      - Stores photo data including URLs, captions, and metadata
      - Default empty array to avoid null values
      - Not nullable to ensure data consistency

  2. Notes
    - Using JSONB for flexible photo data storage
    - Maintains existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'photos'
  ) THEN
    ALTER TABLE projects 
    ADD COLUMN photos JSONB NOT NULL DEFAULT '[]'::jsonb;

    -- Create an index for better query performance on the photos column
    CREATE INDEX idx_projects_photos ON projects USING gin (photos);
  END IF;
END $$;