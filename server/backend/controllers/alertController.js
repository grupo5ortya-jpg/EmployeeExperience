const { Alert, Employee, Person } = require('../connection/sequelize');
const { Op } = require('sequelize');

// Alert types visible per role
const HR_ALERT_TYPES       = ['NEGATIVE_PULSE_SIGNAL', 'FEEDBACK_CYCLE_COMPLETED', 'ONBOARDING_COMPLETED', 'ONBOARDING_TASK_SUBMITTED', 'ONBOARDING_TEMPLATE_SUBMITTED', 'ONBOARDING_TASK_OVERDUE', 'OKR_BEHIND_SCHEDULE', 'OKR_STAGNANT', 'OKR_COMPLETED', 'COURSE_COMPLETION_REQUESTED', 'JOB_OPENING_APPLICATION'];
const EMPLOYEE_ALERT_TYPES = ['PULSE_SURVEY_DUE', 'FEEDBACK_EVALUATION_READY', 'ONBOARDING_TASKS_ASSIGNED', 'ONBOARDING_TASK_SUBMITTED', 'ONBOARDING_TEMPLATE_APPROVED', 'TEAM_PULSE_ALERT', 'TEAM_TASK_OVERDUE', 'FEEDBACK_GAP_ANALYSIS_SENT', 'CONTINUOUS_FEEDBACK_RECEIVED', 'OKR_BEHIND_SCHEDULE', 'OKR_STAGNANT', 'OKR_ASSIGNED', 'COURSE_COMPLETION_APPROVED', 'COURSE_COMPLETION_REJECTED'];

function alertTypeFilter(user) {
	if (!user) return {};
	if (user.role === 'Talento') {
		return { type: { [Op.in]: HR_ALERT_TYPES } };
	}
	// Líder and Colaborador see their own employee-facing alerts
	const filter = { type: { [Op.in]: EMPLOYEE_ALERT_TYPES } };
	if (user.employeeId) filter.employee_id = user.employeeId;
	return filter;
}

const EMPLOYEE_INCLUDE = [
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
];

function formatAlert(a) {
	return {
		id:         a.id,
		type:       a.type,
		message:    a.message,
		sentiment:  a.sentiment,
		riskLevel:  a.risk_level,
		topics:     a.topics ?? [],
		status:     a.status,
		createdAt:  a.createdAt,
		employee: a.employee
			? {
				id:        a.employee.id,
				firstName: a.employee.person?.first_name ?? null,
				lastName:  a.employee.person?.last_name  ?? null,
			}
			: null,
	};
}

const getAlerts = async (req, res, next) => {
	try {
		const where = { ...alertTypeFilter(req.user) };
		if (req.query.status) where.status = req.query.status;

		const alerts = await Alert.findAll({
			where,
			include: EMPLOYEE_INCLUDE,
			order:   [['createdAt', 'DESC']],
		});

		res.json(alerts.map(formatAlert));
	} catch (err) {
		next(err);
	}
};

const getUnreadCount = async (req, res, next) => {
	try {
		const where = { ...alertTypeFilter(req.user), status: 'UNREAD' };
		const count = await Alert.count({ where });
		res.json({ count });
	} catch (err) {
		next(err);
	}
};

const markAsRead = async (req, res, next) => {
	try {
		const alert = await Alert.findByPk(req.params.id);
		if (!alert) return res.status(404).json({ error: 'Alert not found' });

		await alert.update({ status: 'READ' });

		const updated = await Alert.findByPk(alert.id, { include: EMPLOYEE_INCLUDE });
		res.json(formatAlert(updated));
	} catch (err) {
		next(err);
	}
};

module.exports = { getAlerts, getUnreadCount, markAsRead };
