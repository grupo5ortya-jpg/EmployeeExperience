
CREATE EXTENSION IF NOT EXISTS citext;

-- Por si planeas búsquedas rápidas por texto o fuzzy search.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Para monitoreo y debugging.
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
