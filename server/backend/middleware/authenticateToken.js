const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
	const token = req.cookies?.token;

	if (!token)
		return res.status(401).json({ error: 'No autenticado. Iniciá sesión.' });

	try {
		req.user = jwt.verify(token, process.env.JWT_SECRET);
		next();
	} catch {
		res.clearCookie('token');
		return res.status(401).json({ error: 'Sesión expirada. Iniciá sesión nuevamente.' });
	}
};

module.exports = { authenticateToken };
