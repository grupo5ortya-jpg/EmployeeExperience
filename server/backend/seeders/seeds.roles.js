
module.exports = async function (sequelize) {
	// Check if roles already exist
	const { Role } = sequelize.models;
	const roles = await Role.findAll();
	if (roles.length === 0) {
		// Create default roles
		await Role.create({ name: 'Talento' });
		await Role.create({ name: 'Líder' });
		await Role.create({ name: 'Colaborador' });
		await Role.create({ name: 'Alumni' });
	}
};
