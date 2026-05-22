const { User, Role, Employee, Person } = require('../connection/sequelize');

const USER_INCLUDE = [
	{ model: Role, as: 'role', attributes: ['id', 'name'] },
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position', 'status'],
		include: [
			{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] },
		],
	},
];

function formatUser(u) {
	return {
		id:         u.id,
		email:      u.email,
		auth0Id:    u.auth0Id    ?? null,
		role:       u.role       ?? null,
		employee: u.employee
			? {
				id:        u.employee.id,
				position:  u.employee.position,
				status:    u.employee.status,
				firstName: u.employee.person?.first_name ?? null,
				lastName:  u.employee.person?.last_name  ?? null,
			}
			: null,
		createdAt: u.createdAt,
		updatedAt: u.updatedAt,
	};
}

const getAllUsers = async (req, res, next) => {
	try {
		const users = await User.findAll({ include: USER_INCLUDE });
		res.json(users.map(formatUser));
	} catch (err) {
		next(err);
	}
};

const getUserById = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.params.id, { include: USER_INCLUDE });
		if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
		res.json(formatUser(user));
	} catch (err) {
		next(err);
	}
};

const createUser = async (req, res, next) => {
	try {
		const { email, roleId, employeeId, auth0Id } = req.body;

		const user = await User.create({
			email,
			role_id:     roleId,
			employee_id: employeeId || null,
			auth0Id:     auth0Id    || null,
		});

		const full = await User.findByPk(user.id, { include: USER_INCLUDE });
		res.status(201).json(formatUser(full));
	} catch (err) {
		next(err);
	}
};

const updateUser = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.params.id);
		if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

		const { email, roleId, employeeId, auth0Id } = req.body;

		const updates = {};
		if (email      !== undefined) updates.email       = email;
		if (roleId     !== undefined) updates.role_id     = roleId;
		if (employeeId !== undefined) updates.employee_id = employeeId || null;
		if (auth0Id    !== undefined) updates.auth0Id     = auth0Id    || null;

		await user.update(updates);

		const updated = await User.findByPk(user.id, { include: USER_INCLUDE });
		res.json(formatUser(updated));
	} catch (err) {
		next(err);
	}
};

const deleteUser = async (req, res, next) => {
	try {
		const user = await User.findByPk(req.params.id);
		if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });
		await user.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
};
