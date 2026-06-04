
const { Role } = require('../connection/sequelize');
const { Op } = require('sequelize');
const { MODEL_ROLE } = require('../utils/constants');


function core_ctrl_format_outcomming_role(role) {
	return {
		id:   role.id,
		name: role.name,
	};
};


const core_ctrl_get_roles_all = async (req, res, next) => {
	try {
		const roles = await Role.findAll();
		res.json(roles.map(core_ctrl_format_outcomming_role));
	} catch (err) {
		next(err);
	}
};


const core_ctrl_get_active_roles = async (req, res, next) => {
	try {
		const roles = await Role.findAll({ where: { name: { [Op.in]: MODEL_ROLE.ACTIVE_ROLES } } });
		res.json(roles.map(core_ctrl_format_outcomming_role));
	} catch (err) {
		next(err);
	}
};


const core_ctrl_get_role_by_id = async (req, res, next) => {
	try {
		const role = await Role.findByPk(req.params.id);
		if (!role) return next(new Error('Role not found'));
		res.json(core_ctrl_format_outcomming_role(role));
	} catch (err) {
		next(err);
	}
};


module.exports = {
	core_ctrl_get_roles_all,
	core_ctrl_get_active_roles,
	core_ctrl_get_role_by_id
};
