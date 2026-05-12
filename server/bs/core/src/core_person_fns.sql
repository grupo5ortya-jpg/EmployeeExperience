
CREATE OR REPLACE FUNCTION core_person_create(
	p_first_name               TEXT,
	p_last_name                TEXT,
	p_document_type            core_document_type,
	p_document_number          TEXT,
	p_email                    CITEXT,
	p_date_of_birth            DATE,
	p_phone_number             TEXT,
	p_emergency_contact_name   TEXT,
	p_emergency_contact_phone  TEXT,
	p_address		           address,
	p_profile_picture_url      TEXT )
RETURNS core_person AS $$
DECLARE
	v_new_person core_person;
BEGIN
	INSERT INTO core_person (
		first_name,
		last_name,
		document_type,
		document_number,
		email,
		date_of_birth,
		phone_number,
		emergency_contact_name,
		emergency_contact_phone,
		address,
		profile_picture_url
	) VALUES (
		p_first_name,
		p_last_name,
		p_document_type,
		p_document_number,
		p_email,
		p_date_of_birth,
		p_phone_number,
		p_emergency_contact_name,
		p_emergency_contact_phone,
		p_address,
		p_profile_picture_url
	)
	RETURNING * INTO v_new_person;

	RETURN v_new_person;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION core_person(
	p_person_id  INTEGER )
RETURNS core_person AS $$
DECLARE
	v_person core_person;
BEGIN
	SELECT * INTO v_person
		FROM core_person
		WHERE id = p_person_id
		LIMIT 1
	;
	RETURN v_person;
END;
$$ LANGUAGE plpgsql STRICT;


CREATE OR REPLACE FUNCTION core_person_update(
	p_person_id                INTEGER,
	p_first_name               TEXT,
	p_last_name                TEXT,
	p_document_type            core_document_type,
	p_document_number          TEXT,
	p_email                    CITEXT,
	p_date_of_birth            DATE,
	p_phone_number             TEXT,
	p_emergency_contact_name   TEXT,
	p_emergency_contact_phone  TEXT,
	p_address		           address,
	p_profile_picture_url      TEXT )
RETURNS core_person AS $$
DECLARE
	v_updated_person  core_person;
BEGIN
	UPDATE core_person
		SET
			first_name               = COALESCE(p_first_name, first_name),
			last_name                = COALESCE(p_last_name, last_name),
			document_type            = COALESCE(p_document_type, document_type),
			document_number          = COALESCE(p_document_number, document_number),
			email                    = COALESCE(p_email, email),
			date_of_birth            = COALESCE(p_date_of_birth, date_of_birth),
			phone_number             = COALESCE(p_phone_number, phone_number),
			emergency_contact_name   = COALESCE(p_emergency_contact_name, emergency_contact_name),
			emergency_contact_phone  = COALESCE(p_emergency_contact_phone, emergency_contact_phone),
			address                  = COALESCE(p_address, address),
			profile_picture_url      = COALESCE(p_profile_picture_url, profile_picture_url)
		WHERE id = p_person_id
	RETURNING * INTO v_updated_person;

	RETURN v_updated_person;
END;
$$ LANGUAGE plpgsql;
