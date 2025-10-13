/*
  # Add territory field to companies table
  
  1. New Column
    - territory (JSONB): Store territory definition with center coordinates and radius
    
  2. Changes
    - Add column with default empty object
    - Add GIN index for efficient querying
*/

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS territory jsonb DEFAULT '{
  "center": {
    "lat": null,
    "lng": null
  },
  "radius": null
}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_companies_territory ON companies USING GIN (territory jsonb_path_ops);