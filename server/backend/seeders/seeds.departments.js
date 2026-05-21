
module.exports = async function (sequelize) {
	// Check if departments already exist
	const { Department } = sequelize.models;
	const departments = await Department.findAll();
	if (departments.length === 0) {
		// Create default departments
		await Department.create({ name: 'Contabilidad' });
		await Department.create({ name: 'Ventas' });
		await Department.create({ name: 'Marketing' });
		await Department.create({ name: 'Desarrollo' });
	}
};
