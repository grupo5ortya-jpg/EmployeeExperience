
CREATE TABLE core_role (
	id    SERIAL PRIMARY KEY,
	name  TEXT UNIQUE NOT NULL,
	CHECK (
		name IN (
			'Colaborador',
			'Líder',
			'Talento'
		)
	)
);
INSERT INTO core_role (name) VALUES ('Colaborador'), ('Líder'), ('Talento');
