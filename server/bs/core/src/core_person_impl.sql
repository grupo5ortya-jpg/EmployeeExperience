
CREATE TYPE core_document_type AS ENUM(
	'DNI',
	'Pasaporte',
	'Cédula de Identidad',
	'Pasaporte Extranjero',
	'Otro'
);


CREATE TABLE core_person (
	id                       INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	first_name               TEXT NOT NULL,
	last_name                TEXT NOT NULL,
	document_type            core_document_type NOT NULL,
	document_number          TEXT NOT NULL,
	email                    CITEXT NOT NULL UNIQUE REFERENCES core_email(email),
	date_of_birth            DATE NOT NULL,
	phone_number             TEXT,
	emergency_contact_name   TEXT,
	emergency_contact_phone  TEXT,
	address		             address,
	profile_picture_url      TEXT,
	created_at               TIMESTAMPTZ DEFAULT now()
);
CREATE TRIGGER trg_person_email
	BEFORE INSERT OR UPDATE
	ON core_person
	FOR EACH ROW
	EXECUTE FUNCTION trg_fn_register_email()
;
CREATE TRIGGER trg_cleanup_person_email
    AFTER UPDATE
    ON core_person
    FOR EACH ROW
    WHEN (OLD.email IS DISTINCT FROM NEW.email)
    EXECUTE FUNCTION trg_fn_cleanup_email()
;
