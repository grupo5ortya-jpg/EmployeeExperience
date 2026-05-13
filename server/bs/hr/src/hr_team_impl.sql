
CREATE TABLE hr_team (
	leader_id        INTEGER NOT NULL REFERENCES hr_user(id),
	collaborator_id  INTEGER NOT NULL REFERENCES hr_user(id),
	joined_at        TIMESTAMPTZ DEFAULT now(),
	deleted_at       TIMESTAMPTZ DEFAULT NULL,
	PRIMARY KEY (leader_id, collaborator_id),
	CHECK (leader_id <> collaborator_id)
);


CREATE UNIQUE INDEX ux_hr_team_collaborator_active
	ON hr_team(collaborator_id)
	WHERE deleted_at IS NULL
;


CREATE OR REPLACE FUNCTION trg_fn_validate_hr_team()
RETURNS TRIGGER AS $$
DECLARE
	v_leader_role_id        INTEGER;
	v_collaborator_role_id  INTEGER;
BEGIN
	SELECT role_id
	INTO v_leader_role_id
	FROM hr_user
	WHERE id = NEW.leader_id
	;

	IF v_leader_role_id IS NULL THEN
		RAISE EXCEPTION 'Leader user does not exist';
	END IF;

	IF v_leader_role_id <> core_get_role_leader_id() THEN
		RAISE EXCEPTION 'User % is not a leader', NEW.leader_id;
	END IF;


	SELECT role_id
	INTO v_collaborator_role_id
	FROM hr_user
	WHERE id = NEW.collaborator_id
	;

	IF v_collaborator_role_id IS NULL THEN
		RAISE EXCEPTION 'Collaborator user does not exist';
	END IF;

	IF v_collaborator_role_id <> core_get_role_collaborator_id() THEN
		RAISE EXCEPTION 'User % is not a collaborator', NEW.collaborator_id;
	END IF;

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trg_validate_hr_team
	BEFORE INSERT OR UPDATE
	ON hr_team
	FOR EACH ROW
	EXECUTE FUNCTION trg_fn_validate_hr_team()
;
