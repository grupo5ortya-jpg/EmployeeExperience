
CREATE OR REPLACE FUNCTION base_address_create(
	p_country           text,
	p_city              text,
	p_neighborhood      text,
	p_street            text,
	p_number            text,
	p_floor             text,
	p_unit              text,
	p_additional        text,
	p_postal_code       text,
	p_between_street_1  text,
	p_between_street_2  text )
RETURNS address AS $$
	SELECT ROW(
		p_country,
		p_city,
		p_neighborhood,
		p_street,
		p_number,
		p_floor,
		p_unit,
		p_additional,
		p_postal_code,
		p_between_street_1,
		p_between_street_2
	)::address;
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION base_address_update(
	p_original          address,
	p_country           text DEFAULT NULL,
	p_city              text DEFAULT NULL,
	p_neighborhood      text DEFAULT NULL,
	p_street            text DEFAULT NULL,
	p_number            text DEFAULT NULL,
	p_floor             text DEFAULT NULL,
	p_unit              text DEFAULT NULL,
	p_additional        text DEFAULT NULL,
	p_postal_code       text DEFAULT NULL,
	p_between_street_1  text DEFAULT NULL,
	p_between_street_2  text DEFAULT NULL )
RETURNS address AS $$
BEGIN
	RETURN ROW(
		COALESCE(p_country,          p_original.country),
		COALESCE(p_city,             p_original.city),
		COALESCE(p_neighborhood,     p_original.neighborhood),
		COALESCE(p_street,           p_original.street),
		COALESCE(p_number,           p_original.number),
		COALESCE(p_floor,            p_original.floor),
		COALESCE(p_unit,             p_original.unit),
		COALESCE(p_additional,       p_original.additional),
		COALESCE(p_postal_code,      p_original.postal_code),
		COALESCE(p_between_street_1, p_original.between_street_1),
		COALESCE(p_between_street_2, p_original.between_street_2)
	)::address;
END;
$$ LANGUAGE plpgsql;
