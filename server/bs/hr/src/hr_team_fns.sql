
CREATE OR REPLACE FUNCTION hr_team_get_by_leader(
	p_leader_id  INTEGER )
RETURNS SETOF hr_team AS $$
	SELECT *
		FROM hr_team
		WHERE leader_id = p_leader_id
		AND deleted_at IS NULL
	;
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION hr_team_create(
	p_leader_id        INTEGER,
	p_collaborator_id  INTEGER )
RETURNS hr_team AS $$
DECLARE
	v_team  hr_team;
BEGIN
	INSERT INTO hr_team (
		leader_id,
		collaborator_id
	)
	VALUES (
		p_leader_id,
		p_collaborator_id
	)
	RETURNING * INTO v_team;

	RETURN v_team;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION hr_team_assign_collaborator(
	p_leader_id        INTEGER,
	p_collaborator_id  INTEGER )
RETURNS hr_team AS $$
DECLARE
	v_team  hr_team;
BEGIN
	INSERT INTO hr_team (
		leader_id,
		collaborator_id
	)
	VALUES (
		p_leader_id,
		p_collaborator_id
	)
	RETURNING * INTO v_team;

	RETURN v_team;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION hr_team_reassign_collaborator(
	p_collaborator_id  INTEGER,
	p_new_leader_id    INTEGER)
RETURNS hr_team AS $$
DECLARE
	v_team  hr_team;
BEGIN
	UPDATE hr_team
		SET leader_id = p_new_leader_id
		WHERE collaborator_id = p_collaborator_id
		AND deleted_at IS NULL
		RETURNING * INTO v_team
	;

	IF v_team IS NULL THEN
		RAISE EXCEPTION 'Collaborator % has no active team', p_collaborator_id;
	END IF;

	RETURN v_team;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION hr_team_remove_collaborator(
	p_collaborator_id  INTEGER )
RETURNS hr_team AS $$
DECLARE
	v_team hr_team;
BEGIN
	UPDATE hr_team
		SET deleted_at = now()
		WHERE collaborator_id = p_collaborator_id
		AND deleted_at IS NULL
		RETURNING * INTO v_team
	;

	IF v_team IS NULL THEN
		RAISE EXCEPTION 'Collaborator % has no active team', p_collaborator_id;
	END IF;

	RETURN v_team;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION hr_team_get_by_collaborator(
	p_collaborator_id  INTEGER )
RETURNS hr_team AS $$
	SELECT *
		FROM hr_team
		WHERE collaborator_id = p_collaborator_id
		AND deleted_at IS NULL
	;
$$ LANGUAGE SQL STABLE;
