
CREATE TABLE hr_user (
	id          INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	person_id   INTEGER UNIQUE NOT NULL REFERENCES core_person(id) ON DELETE CASCADE,
	email       CITEXT NOT NULL REFERENCES core_email(email),
	role_id     INTEGER REFERENCES core_role(id) DEFAULT core_get_role_collaborator_id(),
	status      TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Alumni')),
	created_at  TIMESTAMPTZ DEFAULT now()
);
	--! TODO: AGREAGAR CAMPOS DE AUTENTICACIÓN
	--! (password_hash, last_login, etc.) - Auth module
CREATE TRIGGER trg_user_email
	BEFORE INSERT OR UPDATE
	ON hr_user
	FOR EACH ROW
	EXECUTE FUNCTION trg_fn_register_email()
;
