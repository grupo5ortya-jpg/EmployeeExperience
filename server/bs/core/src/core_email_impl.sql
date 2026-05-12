
CREATE TABLE core_email (
	email CITEXT PRIMARY KEY
);


CREATE OR REPLACE FUNCTION trg_fn_register_email()
RETURNS TRIGGER AS $$
BEGIN
	IF TG_OP = 'INSERT'
	OR (TG_OP = 'UPDATE' AND OLD.email IS DISTINCT FROM NEW.email)
	THEN
		BEGIN
			INSERT INTO core_email(email)
			VALUES (NEW.email);

		EXCEPTION
			WHEN unique_violation THEN
				RAISE EXCEPTION 'Email "%" already exists', NEW.email;
		END;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION trg_fn_cleanup_email()
RETURNS TRIGGER AS $$
BEGIN
	DELETE FROM core_email
	WHERE email = OLD.email
	AND NOT EXISTS (
		SELECT 1 FROM core_person WHERE email = OLD.email
		UNION
		SELECT 1 FROM hr_user WHERE email = OLD.email
	);
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;
