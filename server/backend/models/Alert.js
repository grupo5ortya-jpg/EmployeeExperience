
const { DataTypes } = require('sequelize');
const { ALERT } = require('../utils/constants/models.constants.js');


module.exports = (sequelize) => {
	sequelize.define('Alert', {
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		employee_id: {
			type: DataTypes.UUID,
			allowNull: false,
		},
		type: {
			type: DataTypes.STRING(60),
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		sentiment: {
			type: DataTypes.ENUM(...Object.values(ALERT.SENTIMENTS)),
			allowNull: true,
		},
		risk_level: {
			type: DataTypes.ENUM(...Object.values(ALERT.RISK_LEVELS)),
			allowNull: true,
		},
		topics: {
			type: DataTypes.JSONB,
			allowNull: true,
			defaultValue: [],
		},
		status: {
			type: DataTypes.ENUM(...Object.values(ALERT.STATUS)),
			allowNull: false,
			defaultValue: ALERT.STATUS_UNREAD,
		},
	}, {
		sequelize,
		modelName: 'Alert',
		tableName: 'alerts',
		timestamps: true,
		schema: process.env.DB_SCHEMA || 'public',
		hooks: {
			// Fire-and-forget — ninguno de los dos hooks devuelve/espera la promesa, para no
			// bloquear el create()/bulkCreate() que disparó la alerta (mismo criterio que
			// Alert.create({...}).catch(console.error) ya usado en todo el proyecto). Require
			// diferido para evitar un ciclo con controllers/alertController.js (que carga este
			// mismo modelo vía connection/sequelize.js).
			//
			// Todo el cuerpo va en try/catch — un require roto, un error de sintaxis en
			// alertMailer.js, o cualquier otro throw síncrono ACÁ (no en el envío de mail en sí,
			// que ya se maneja en notifyAlertByEmail/mailer.js) terminaría rechazando la promesa
			// de create()/bulkCreate(), rompiendo cualquier endpoint que la dispare. Verificado:
			// sin este try/catch, un alertMailer.js roto hace que Alert.create() rechace.
			afterCreate: (alert) => {
				try {
					require('../utils/alertMailer.js')
						.notifyAlertByEmail(alert, sequelize)
						.catch((err) => console.error('[Alert] Error en notificación por email:', err));
				} catch (err) {
					console.error('[Alert] Error inesperado al disparar notificación por email:', err);
				}
			},
			afterBulkCreate: (alerts) => {
				try {
					for (const alert of alerts) {
						require('../utils/alertMailer.js')
							.notifyAlertByEmail(alert, sequelize)
							.catch((err) => console.error('[Alert] Error en notificación por email:', err));
					}
				} catch (err) {
					console.error('[Alert] Error inesperado al disparar notificación por email (bulk):', err);
				}
			},
		},
	});
};
