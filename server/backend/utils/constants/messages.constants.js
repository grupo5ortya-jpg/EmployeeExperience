
module.exports = {
	ERRORS: {
		MODEL: {
			ASSET_ERR: {
				ASSIGNED_TO_EMPLOYEE: 'Cannot delete the asset because it is currently assigned to an employee.'
			},
			DEPARTMENT_ERR: {
				HAS_ASSIGNED_EMPLOYEES: 'Cannot delete the department because it has assigned employees.'
			},
			JOB_OPENING_SKILL_ERR: {
				SKILL_ID_REQUIRED_FOR_LEVEL_VALIDATION: 'skill_id is required to validate required_level.',
				SKILL_NOT_FOUND: 'Skill not found for the provided skill_id.',
				REQUIRED_LEVEL_MUST_BE_INTEGER: 'required_level must be an integer.',
				REQUIRED_LEVEL_NOT_IN_SKILL_LEVELS: 'required_level must exist in the skill levels.',
			},
			ROLE_ERR: {
				INVALID_ROLE: (validRoles) => `Role must be one of: ${validRoles.join(', ')}`,
			},
			SKILL_ERR: {
				LEVELS_MUST_BE_ARRAY: 'Levels must be an array.',
				INVALID_LEVEL_AT_POSITION: (index) => `Invalid level at position ${index}.`,
			},
			TEAM_ERR: {
				LEADER_AND_COLLABORATOR_REQUIRED: 'leader_id and collaborator_id are required.',
				LEADER_AND_COLLABORATOR_MUST_BE_DIFFERENT: 'leader_id and collaborator_id must be different.',
				LEADER_NOT_FOUND: 'leader_id must point to an existing employee.',
				COLLABORATOR_NOT_FOUND: 'collaborator_id must point to an existing employee.',
				LEADER_MUST_HAVE_LEADER_ROLE: 'leader_id must belong to a user with role Líder.',
				COLLABORATOR_ALREADY_ASSIGNED: 'collaborator_id already belongs to another group.',
			},
		},
		MODEL_NOT_FOUND: (model) => `${model} Not Found.`,
	},
};
