-- Interior Quotation App — MySQL schema
--
-- Mirrors the shape the app already used for localStorage: one JSON blob per
-- top-level data key (projects, subProjects, prices, templates, ...). This
-- avoids re-modeling deeply nested structures (rooms -> boxes -> parts ->
-- formulas, hardware items, custom fields, etc.) as dozens of relational
-- tables, while still giving every key its own durable, queryable row.
--
-- Run this once against a fresh database:
--   mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS interior_quotation_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE interior_quotation_app;

CREATE TABLE IF NOT EXISTS app_state (
  data_key    VARCHAR(64) NOT NULL PRIMARY KEY,
  data_json   LONGTEXT NOT NULL,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
              ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed every key the app expects so a first GET /state.php never has to
-- special-case a missing row — state.php also falls back to these same
-- defaults in PHP, this is just belt-and-braces.
INSERT INTO app_state (data_key, data_json) VALUES
  ('projects', '[]'),
  ('subProjects', '[]'),
  ('dimensions', '[]'),
  ('prices', '[]'),
  ('materialModelRates', '{}'),
  ('materialModelProfitPercent', '{"economy":0,"standard":0,"premium":0}'),
  ('templates', '[]'),
  ('selectedTemplateId', '""'),
  ('generatedParts', '[]'),
  ('configuredWardrobe', 'null'),
  ('wardrobeRecords', '[]'),
  ('editingWardrobeRecordId', 'null'),
  ('materialStockSettings', '{}'),
  ('kerfWidth', '0')
ON DUPLICATE KEY UPDATE data_key = data_key;
