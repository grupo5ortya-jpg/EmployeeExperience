/**
 * Role-based access middleware.
 * Usage: router.post('/', authorize('Talento'), handler)
 *        router.post('/', authorize('Talento', 'Líder'), handler)
 *
 * Requires authenticateToken to run first (req.user must be set).
 */
const authorize = (...roles) => (req, res, next) => {
	if (!req.user) return res.status(401).json({ error: 'No autenticado.' });

	if (!roles.includes(req.user.role))
		return res.status(403).json({
			error: `Acceso denegado. Se requiere rol: ${roles.join(' o ')}.`,
		});

	next();
};

module.exports = { authorize };
