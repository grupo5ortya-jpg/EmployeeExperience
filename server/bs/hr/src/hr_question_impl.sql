
CREATE TYPE hr_question_kind AS ENUM(
	'Abierta',
	'Cerrada'
);


CREATE TYPE hr_question_type AS ENUM(
	'Pulso 30/60/90',
	'Offboarding',
	'Onboarding',
	'Feedback'
);


CREATE TABLE hr_question (
	id           SERIAL PRIMARY KEY,
	title        TEXT NOT NULL,
	description  TEXT,
	type         hr_question_type NOT NULL,
	kind         hr_question_kind NOT NULL
);