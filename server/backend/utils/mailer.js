const nodemailer = require('nodemailer');

let transporter = null;

function isEmailEnabled() {
	return process.env.EMAIL_ENABLED === 'true';
}

function getTransporter() {
	if (transporter) return transporter;

	transporter = nodemailer.createTransport({
		host:   process.env.SMTP_HOST,
		port:   Number(process.env.SMTP_PORT) || 587,
		secure: process.env.SMTP_SECURE === 'true',
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASSWORD,
		},
	});

	return transporter;
}

// Fire-and-forget — nunca debe romper el flujo que la llama (mismo criterio que
// Alert.create({...}).catch(console.error) ya usado en todo el proyecto).
async function sendMail({ to, subject, html }) {
	if (!isEmailEnabled()) return;
	if (!to) return;

	try {
		const info = await getTransporter().sendMail({
			from: process.env.SMTP_FROM || process.env.SMTP_USER,
			to,
			subject,
			html,
		});
		console.log(`[mailer] Email enviado a ${to} (${info.messageId})`);
		const previewUrl = nodemailer.getTestMessageUrl(info);
		if (previewUrl) console.log(`[mailer] Preview: ${previewUrl}`);
	} catch (err) {
		console.error('[mailer] Error enviando email:', err.message);
	}
}

module.exports = { sendMail, isEmailEnabled };
