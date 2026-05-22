const { Role } = require('../connection/sequelize');

function formatRole(r) {
	return {
		id:   r.id,
		name: r.name,
	};
}

const getAllRoles = async (req, res, next) => {
	try {
		const roles = await Role.findAll();
		res.json(roles.map(formatRole));
	} catch (err) {
		next(err);
	}
};

const getRoleById = async (req, res, next) => {
	try {
		const role = await Role.findByPk(req.params.id);
		if (!role) return res.status(404).json({ status: 'fail', message: 'Role not found' });
		res.json(formatRole(role));
	} catch (err) {
		next(err);
	}
};

const createRole = async (req, res, next) => {
	try {
		const { name } = req.body;
		const role = await Role.create({ name });
		res.status(201).json(formatRole(role));
	} catch (err) {
		next(err);
	}
};

const updateRole = async (req, res, next) => {
	try {
		const role = await Role.findByPk(req.params.id);
		if (!role) return res.status(404).json({ status: 'fail', message: 'Role not found' });

		const { name } = req.body;
		if (name !== undefined) await role.update({ name });

		res.json(formatRole(role));
	} catch (err) {
		next(err);
	}
};

const deleteRole = async (req, res, next) => {
	try {
		const role = await Role.findByPk(req.params.id);
		if (!role) return res.status(404).json({ status: 'fail', message: 'Role not found' });
		await role.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllRoles,
	getRoleById,
	createRole,
	updateRole,
	deleteRole,
};
