const { sendMail, isEmailEnabled } = require('./mailer');
const { ROLE } = require('./constants/models.constants.js');

function buildEmailHtml(message) {
	const frontendUrl = process.env.FRONTEND_URL || '';
	return `
		<p>${message}</p>
		${frontendUrl ? `<p><a href="${frontendUrl}">Ver en la plataforma</a></p>` : ''}
	`;
}

// Disparado desde los hooks afterCreate/afterBulkCreate de models/Alert.js — recibe la
// instancia ya creada + el sequelize de esa misma conexión (sequelize.models, no un require de
// connection/sequelize.js, para no generar un require circular con models/Alert.js).
async function notifyAlertByEmail(alert, sequelize) {
	if (!isEmailEnabled()) return;

	try {
		// Require diferido (recién se ejecuta cuando la alerta ya existe, no al cargar el
		// módulo) — alertController.js requiere connection/sequelize.js, que a su vez carga
		// este mismo modelo; requerirlo arriba del archivo generaría un ciclo.
		const { HR_ALERT_TYPES, EMPLOYEE_ALERT_TYPES } = require('../controllers/alertController.js');
		const { Employee, User, Role } = sequelize.models;

		const subject = 'Nueva notificación — Employee Experience';
		const html    = buildEmailHtml(alert.message);

		// Algunos tipos (ej. OKR_BEHIND_SCHEDULE) están en ambas listas — la misma alerta es
		// visible para HR (sin filtro de employee_id) y para el empleado puntual a la vez, así
		// que ambos chequeos corren siempre, no son mutuamente excluyentes.
		if (EMPLOYEE_ALERT_TYPES.includes(alert.type)) {
			const employee = await Employee.findByPk(alert.employee_id, {
				include: [{ model: User, as: 'user' }],
			});
			if (employee?.user?.email) {
				await sendMail({ to: employee.user.email, subject, html });
			}
		}

		if (HR_ALERT_TYPES.includes(alert.type)) {
			const talentoRole = await Role.findOne({ where: { name: ROLE.TALENTO } });
			if (talentoRole) {
				const talentoUsers = await User.findAll({ where: { role_id: talentoRole.id } });
				const recipients   = talentoUsers.map((u) => u.email).filter(Boolean);
				await Promise.all(recipients.map((to) => sendMail({ to, subject, html })));
			}
		}
	} catch (err) {
		console.error('[alertMailer] Error resolviendo destinatario(s) de email:', err.message);
	}
}

module.exports = { notifyAlertByEmail };
