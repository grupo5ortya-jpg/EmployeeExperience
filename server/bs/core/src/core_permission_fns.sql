
-- CREATE OR REPLACE FUNCTION hr_user_has_permission(
-- 	--! TODO:
-- 	)
-- RETURNS BOOLEAN AS $$
-- BEGIN
-- END;
-- $$ LANGUAGE plpgsql;


-- CREATE OR REPLACE FUNCTION core_remove_permission_from_user(
-- 	role_name        TEXT,
-- 	permission_name  TEXT
-- )
-- RETURNS VOID AS $$
-- BEGIN
-- 	DELETE FROM hr_user_permission
-- 	WHERE role_name = core_remove_permission_from_user.role_name
-- 	AND permission_name = core_remove_permission_from_user.permission_name;
-- END;
-- $$ LANGUAGE plpgsql;