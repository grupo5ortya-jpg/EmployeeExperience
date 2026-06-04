
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
};
