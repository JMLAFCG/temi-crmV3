/*
  # Fix colonnes JSONB étape par étape
*/

-- 1. Clients address
ALTER TABLE clients ALTER COLUMN address DROP DEFAULT;
ALTER TABLE clients ALTER COLUMN address TYPE text USING address::text;
ALTER TABLE clients ALTER COLUMN address SET DEFAULT '';

-- 2. Projects location
ALTER TABLE projects ALTER COLUMN location DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN location TYPE text USING location::text;
ALTER TABLE projects ALTER COLUMN location SET DEFAULT '';

-- 3. Projects timeline
ALTER TABLE projects ALTER COLUMN timeline DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN timeline TYPE text USING timeline::text;
ALTER TABLE projects ALTER COLUMN timeline SET DEFAULT '';

-- 4. Projects surface
ALTER TABLE projects ALTER COLUMN surface DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN surface TYPE numeric USING (surface::text)::numeric;
ALTER TABLE projects ALTER COLUMN surface SET DEFAULT 0;

-- 5. Projects budget
ALTER TABLE projects ALTER COLUMN budget DROP DEFAULT;
ALTER TABLE projects ALTER COLUMN budget TYPE numeric USING (budget::text)::numeric;
ALTER TABLE projects ALTER COLUMN budget SET DEFAULT 0;
