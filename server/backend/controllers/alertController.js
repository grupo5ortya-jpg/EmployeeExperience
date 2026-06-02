const { Alert, Employee, Person } = require('../connection/sequelize');
const { Op } = require('sequelize');

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
		const { status } = req.query;
		const where = {};
		if (status) where.status = status;

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

const getUnreadCount = async (_req, res, next) => {
	try {
		const count = await Alert.count({ where: { status: 'UNREAD' } });
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
