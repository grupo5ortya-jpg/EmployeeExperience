

-- SHOW SEARCH_PATH;
-- SELECT current_database();

CREATE SCHEMA IF NOT EXISTS core;
SET SEARCH_PATH TO core, public;


CREATE TYPE address AS (
	country           text,
	city              text,
	neighborhood      text,
	street            text,
	number            text,
	floor             text,
	unit              text,
	additional_info   text,
	postal_code       text,
	between_street_1  text,
	between_street_2  text
);


CREATE TABLE core_user (
	id              INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	email_business  TEXT UNIQUE NOT NULL,
	email_personal  TEXT UNIQUE NOT NULL,
	password_hash   TEXT NOT NULL,
	first_name      TEXT NOT NULL,
	last_name       TEXT NOT NULL,
	address		    address,
	is_active       BOOLEAN DEFAULT true,
	created_at      TIMESTAMPTZ DEFAULT now(),
	deleted_at      TIMESTAMPTZ DEFAULT NULL
);
CREATE UNIQUE INDEX unique_all_emails
	ON core_user (email_business, email_personal)
;
ALTER TABLE core_user
	ADD CONSTRAINT email_different_check
	CHECK (email_business <> email_personal)
;


CREATE TABLE core_role (
	id    SERIAL PRIMARY KEY,
	name  TEXT UNIQUE NOT NULL
);


CREATE TABLE user_role (
	user_id  INTEGER REFERENCES core_user(id) ON DELETE CASCADE,
	role_id  INTEGER REFERENCES core_role(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, role_id)
);


CREATE TABLE core_permission (
	id    SERIAL PRIMARY KEY,
	name  TEXT UNIQUE NOT NULL
);


CREATE TABLE role_permission (
	role_id        INTEGER REFERENCES core_role(id) ON DELETE CASCADE,
	permission_id  INTEGER REFERENCES core_permission(id) ON DELETE CASCADE,
	PRIMARY KEY (role_id, permission_id)
);


CREATE TABLE core_task (
	id           SERIAL PRIMARY KEY,
	title        TEXT NOT NULL,
	description  TEXT,
	status       TEXT NOT NULL,
	priority     TEXT NOT NULL,
	due_date     TIMESTAMPTZ
);

CREATE TABLE user_task (
	user_id  INTEGER REFERENCES core_user(id) ON DELETE CASCADE,
	task_id  INTEGER REFERENCES core_task(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, task_id)
);


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
	kind         hr_question_kind NOT NULL,
	type         hr_question_type NOT NULL
);

CREATE TABLE hr_question_option (
	id           SERIAL PRIMARY KEY,
	question_id  INTEGER REFERENCES hr_question(id) ON DELETE CASCADE,
	label        TEXT NOT NULL,
	value        INTEGER
);


CREATE TABLE hr_question_answer (
	id           SERIAL PRIMARY KEY,
	question_id  INTEGER REFERENCES hr_question(id),
	user_id      INTEGER REFERENCES core_user(id),
	answer_text  TEXT,
	option_id    INTEGER REFERENCES hr_question_option(id),
	created_at   TIMESTAMPTZ DEFAULT now()
);


CREATE TABLE hr_task (
	id           SERIAL PRIMARY KEY,
	title        TEXT NOT NULL,
	description  TEXT,
	status       TEXT NOT NULL,
	priority     TEXT NOT NULL,
	due_date     TIMESTAMPTZ
);

CREATE TABLE hr_user_task (
	user_id  INTEGER REFERENCES core_user(id) ON DELETE CASCADE,
	task_id  INTEGER REFERENCES hr_task(id) ON DELETE CASCADE,
	PRIMARY KEY (user_id, task_id)
);


