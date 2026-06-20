const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const { User, Employee, Person, Role, EmployeeOffboarding } = require('../connection/sequelize');
const { ROLE } = require('../utils/constants/models.constants.js');

const COOKIE_NAME = 'token';

const cookieOptions = () => ({
	httpOnly: true,
	sameSite: 'lax',
	maxAge:   8 * 60 * 60 * 1000,               // 8 horas en ms
	secure:   process.env.NODE_ENV === 'production',
});

const USER_INCLUDE = [
	{ model: Role,     as: 'role',     attributes: ['id', 'name'] },
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position', 'status'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
];

// Para rol Alumni se expone exitType (RESIGNATION/TERMINATION) del último EmployeeOffboarding —
// el frontend lo usa para ocultar checklist/entrevista/Alertas cuando el motivo fue despido
// (no se le asignó nada de eso). El propio Alumni no puede consultar /offboarding (Talento-only),
// por eso este dato viaja en el usuario autenticado.
async function formatUser(user) {
	let exitType = null;
	if (user.role?.name === ROLE.ALUMNI && user.employee_id) {
		const offboarding = await EmployeeOffboarding.findOne({
			where: { employee_id: user.employee_id },
			order:  [['started_at', 'DESC']],
		});
		exitType = offboarding?.exit_type ?? null;
	}

	return {
		id:         user.id,
		email:      user.email,
		role:       user.role?.name   ?? null,
		employeeId: user.employee_id  ?? null,
		firstName:  user.employee?.person?.first_name ?? null,
		lastName:   user.employee?.person?.last_name  ?? null,
		position:   user.employee?.position           ?? null,
		exitType,
	};
}

// POST /auth/login
const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;
		if (!email || !password)
			return res.status(400).json({ error: 'Email y contraseña requeridos.' });

		const user = await User.findOne({ where: { email }, include: USER_INCLUDE });
		if (!user)
			return res.status(401).json({ error: 'Credenciales inválidas.' });

		const valid = await bcrypt.compare(password, user.passwordHash ?? '');
		if (!valid)
			return res.status(401).json({ error: 'Credenciales inválidas.' });

		const token = jwt.sign(
			{
				userId:     user.id,
				email:      user.email,
				role:       user.role?.name,
				employeeId: user.employee_id,
			},
			process.env.JWT_SECRET,
			{ expiresIn: '8h' },
		);

		res.cookie(COOKIE_NAME, token, cookieOptions());
		res.json(await formatUser(user));
	} catch (err) {
		next(err);
	}
};

// POST /auth/logout
const logout = (_req, res) => {
	res.clearCookie(COOKIE_NAME);
	res.json({ ok: true });
};

// GET /auth/me  (requires authenticateToken middleware)
const me = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.user.userId, { include: USER_INCLUDE });
		if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
		res.json(await formatUser(user));
	} catch (err) {
		next(err);
	}
};

module.exports = { login, logout, me };
