
const { Op } = require('sequelize');

module.exports = async function (sequelize, employees, roleNames) {
	const { User, Role } = sequelize.models;

	const count = await User.count();
	if (count > 0) {
		return;
	}

	if (!employees || !roleNames) {
		throw new Error('seeds.users.js requires employees and roleNames parameters');
	}

	const uniqueRoleNames = [...new Set(roleNames)];
	const roles = await Role.findAll({ where: { name: { [Op.in]: uniqueRoleNames } } });
	const roleByName = roles.reduce((acc, role) => {
		acc[role.name] = role;
		return acc;
	}, {});

	for (const requiredRole of ['Talento', 'Alumni', 'Colaborador', 'Líder']) {
		if (!roleByName[requiredRole]) {
			throw new Error(`Role not found: ${requiredRole}. Run seeds.roles.js first or verify roles exist.`);
		}
	}

	const usersData = employees.map((employee, index) => {
		const roleName = roleNames[index];
		const normalizedRole = roleName
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.replace(/\s+/g, '')
			.toLowerCase();
		return {
			email: `${normalizedRole}${index + 1}@example.com`,
			passwordHash: `pass${index + 1}`,
			role_id: roleByName[roleName].id,
			employee_id: employee.id,
		};
	});

	await User.bulkCreate(usersData);
};
