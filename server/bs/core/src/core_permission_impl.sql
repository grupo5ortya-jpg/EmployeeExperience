
CREATE TABLE core_permission (
	id    SERIAL PRIMARY KEY,
	name  TEXT UNIQUE NOT NULL
);
INSERT INTO core_permission (name) VALUES
	('user.view.self'),
	('user.create.new'),
	('user.edit.self'),
	('user.view.team'),
	('user.view.organization')
;
--! TODO: add more permissions


CREATE TABLE core_role_permissions (
	role_id        INTEGER REFERENCES core_role(id) ON DELETE CASCADE,
	permission_id  INTEGER REFERENCES core_permission(id) ON DELETE CASCADE,
	PRIMARY KEY (role_id, permission_id)
);


INSERT INTO core_role_permissions (role_id, permission_id) VALUES
	((SELECT id FROM core_role WHERE name = 'Colaborador'),  (SELECT id FROM core_permission WHERE name = 'user.view.self')),
	((SELECT id FROM core_role WHERE name = 'Colaborador'),  (SELECT id FROM core_permission WHERE name = 'user.edit.self')),
	((SELECT id FROM core_role WHERE name = 'Líder'),        (SELECT id FROM core_permission WHERE name = 'user.view.self')),
	((SELECT id FROM core_role WHERE name = 'Líder'),        (SELECT id FROM core_permission WHERE name = 'user.edit.self')),
	((SELECT id FROM core_role WHERE name = 'Líder'),        (SELECT id FROM core_permission WHERE name = 'user.view.team')),
	((SELECT id FROM core_role WHERE name = 'Talento'),      (SELECT id FROM core_permission WHERE name = 'user.view.self')),
	((SELECT id FROM core_role WHERE name = 'Talento'),      (SELECT id FROM core_permission WHERE name = 'user.edit.self')),
	((SELECT id FROM core_role WHERE name = 'Talento'),      (SELECT id FROM core_permission WHERE name = 'user.create.new')),
	((SELECT id FROM core_role WHERE name = 'Talento'),      (SELECT id FROM core_permission WHERE name = 'user.view.team')),
	((SELECT id FROM core_role WHERE name = 'Talento'),      (SELECT id FROM core_permission WHERE name = 'user.view.organization'))
;
--! TODO: add more role-permission associations