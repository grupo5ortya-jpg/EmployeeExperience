
CREATE OR REPLACE FUNCTION core_get_role_leader()
RETURNS core_role AS $$
	SELECT * FROM core_role WHERE name = 'Líder';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_leader_id()
RETURNS INTEGER AS $$
	SELECT id FROM core_role WHERE name = 'Líder';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_collaborator()
RETURNS core_role AS $$
	SELECT * FROM core_role WHERE name = 'Colaborador';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_collaborator_id()
RETURNS INTEGER AS $$
	SELECT id FROM core_role WHERE name = 'Colaborador';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_talent()
RETURNS core_role AS $$
	SELECT * FROM core_role WHERE name = 'Talento';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_talent_id()
RETURNS INTEGER AS $$
	SELECT id FROM core_role WHERE name = 'Talento';
$$ LANGUAGE SQL STABLE;


CREATE OR REPLACE FUNCTION core_get_role_by_name(
	p_name  TEXT )
RETURNS core_role AS $$
	SELECT * FROM core_role WHERE name = p_name;
$$ LANGUAGE SQL STABLE STRICT;
