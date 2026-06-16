
module.exports = {
	ALERT: {
		SENTIMENTS: ['positive', 'neutral', 'negative'],
		RISK_LEVELS: ['low', 'medium', 'high'],
		STATUS: ['UNREAD', 'READ'],
		STATUS_UNREAD: 'UNREAD',
		STATUS_READ: 'READ',
	},
	CONTINUOUS_FEEDBACK: {
		TYPES: ['RECOGNITION', 'SUGGESTION'],
	},
	EMPLOYEE: {
		STATUS: ['ACTIVE', 'INACTIVE'],
		STATUS_ACTIVE: 'ACTIVE',
		STATUS_INACTIVE: 'INACTIVE',
	},
	EMPLOYEE_TASK: {
		STATUS: ['ENROLLED', 'IN_PROGRESS', 'SUBMITTED', 'COMPLETED', 'DROPPED'],
		STATUS_ENROLLED: 'ENROLLED',
		STATUS_IN_PROGRESS: 'IN_PROGRESS',
		STATUS_SUBMITTED: 'SUBMITTED',
		STATUS_COMPLETED: 'COMPLETED',
		STATUS_DROPPED: 'DROPPED',
	},
	FEEDBACK_ASSIGNMENT: {
		TYPES: ['SELF', 'PEER', 'LEADER', 'DIRECT_REPORT'],
		STATUS: ['PENDING', 'COMPLETED'],
		STATUS_PENDING: 'PENDING',
		STATUS_COMPLETED: 'COMPLETED',
	},
	OKR: {
		PERIODS: ['QUARTERLY', 'YEARLY'],
		METRIC_TYPES: ['NUMBER', 'PERCENTAGE', 'CURRENCY'],
		STATUS: ['ON_TRACK', 'AT_RISK', 'STAGNANT', 'COMPLETED'],
		STATUS_ON_TRACK: 'ON_TRACK',
		STATUS_AT_RISK: 'AT_RISK',
		STATUS_STAGNANT: 'STAGNANT',
		STATUS_COMPLETED: 'COMPLETED',
		STAGNANT_DAYS: 30,
		RISK_THRESHOLD_PERCENT: 15,
	},
	JOB_OPENING: {
		STATUS: ['open', 'closed'],
		STATUS_OPEN: 'open',
		STATUS_CLOSED: 'closed',
	},
	PERSON: {
		DOCUMENT_TYPES: ['DNI', 'LC', 'LE', 'CI', 'PASAPORTE EXTRANJERO', 'OTRO'],
	},
	PULSE_ANALYSIS: {
		SENTIMENTS: ['positive', 'neutral', 'negative'],
		RISK_LEVELS: ['low', 'medium', 'high'],
	},
	QUESTION: {
		TYPES: ['Abierta', 'Cerrada'],
		ESTIMATED_DURATION: {
			COMMENT: 'Estimated duration in days',
		},
	},
	ROLE: {
		ACTIVE_ROLES: ['Talento', 'Líder', 'Colaborador'],
		INACTIVE_ROLES: ['Alumni'],
	},
	SKILL: {
		TYPES: ['hard', 'soft'],
		TYPES_HARD: 'hard',
		TYPES_SOFT: 'soft',
		DEFAULT_HARD_LEVELS: [
			{ name: 'Trainee', order: 1 },
			{ name: 'Junior', order: 2 },
			{ name: 'Semi-Senior', order: 3 },
			{ name: 'Senior', order: 4 },
			{ name: 'Expert', order: 5 },
		],
		DEFAULT_SOFT_LEVELS: [
			{ name: 'Basic', order: 1 },
			{ name: 'Intermediate', order: 2 },
			{ name: 'Advanced', order: 3 },
			{ name: 'Expert', order: 4 },
		],
	},
	SURVEY_ASSIGNMENT: {
		STATUS: ['PENDING', 'COMPLETED'],
		STATUS_PENDING: 'PENDING',
		STATUS_COMPLETED: 'COMPLETED',
	},
	TASK: {
		ESTIMATED_DURATION: {
			MIN: 0,
			COMMENT: 'Estimated duration in days',
		}
	},
	TASK_TYPE: {
		TASK_TYPE_SUB_TYPE_CAPACITATION_HARD: 'Certificación - Hard Skill',
		TASK_TYPE_SUB_TYPE_CAPACITATION_SOFT: 'Certificación - Soft Skill',
		TASK_TYPE_SUB_TYPE_COURSE: 'Curso',
		TASK_TYPE_SUB_TYPE_CHECKLIST: 'Checklist',
	},
};
