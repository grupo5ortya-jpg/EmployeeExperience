const { Alert } = require('./sequelize');

const RISK_LABEL = { low: 'baja', medium: 'media', high: 'alta' };

async function createPulseAlert({ employeeId, pulseSubType, riskLevel, sentiment, topics, summary }) {
	const riskLabel = RISK_LABEL[riskLevel] ?? riskLevel;
	const message = `Señal detectada en encuesta Pulso ${pulseSubType}: ${summary} (riesgo ${riskLabel})`;

	await Alert.create({
		employee_id: employeeId,
		type:        'NEGATIVE_PULSE_SIGNAL',
		message,
		sentiment:   sentiment ?? null,
		risk_level:  riskLevel ?? null,
		topics:      topics    ?? [],
		status:      'UNREAD',
	});
}

module.exports = { createPulseAlert };
