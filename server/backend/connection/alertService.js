const { Alert, Team } = require('./sequelize');

const RISK_LABEL = { low: 'baja', medium: 'media', high: 'alta' };

async function createPulseAlert({ employeeId, pulseSubType, riskLevel, sentiment, topics, summary, reasoning }) {
	const riskLabel = RISK_LABEL[riskLevel] ?? riskLevel;
	const message   = reasoning
		? `Pulso ${pulseSubType}: ${summary} — ${reasoning} (riesgo ${riskLabel})`
		: `Señal detectada en encuesta Pulso ${pulseSubType}: ${summary} (riesgo ${riskLabel})`;

	// Alert for HR
	await Alert.create({
		employee_id: employeeId,
		type:        'NEGATIVE_PULSE_SIGNAL',
		message,
		sentiment:   sentiment ?? null,
		risk_level:  riskLevel ?? null,
		topics:      topics    ?? [],
		status:      'UNREAD',
	});

	// Alert for the employee's direct leader
	const leaderTeam = await Team.findOne({ where: { collaborator_id: employeeId } });
	if (leaderTeam?.leader_id) {
		await Alert.create({
			employee_id: leaderTeam.leader_id,
			type:        'TEAM_PULSE_ALERT',
			message:     `Un colaborador de tu equipo mostró señales negativas en su encuesta de pulso ${pulseSubType} días. Riesgo ${riskLabel}.`,
			risk_level:  riskLevel ?? null,
			topics:      topics    ?? [],
			status:      'UNREAD',
		});
	}
}

module.exports = { createPulseAlert };
