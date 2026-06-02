
module.exports = async function (sequelize) {
	const { EmployeeAsset, Employee, Asset } = sequelize.models;

	const count = await EmployeeAsset.count();
	if (count > 0) {
		return;
	}

	const activeEmployees = await Employee.findAll({
		where: { status: 'ACTIVE' },
	});

	if (activeEmployees.length === 0) {
		throw new Error('No active employees found. Create active employees before seeding EmployeeAsset.');
	}

	const assets = await Asset.findAll();

	if (assets.length === 0) {
		throw new Error('No assets found. Create assets before seeding EmployeeAsset.');
	}

	// Dejar 5 assets sin asignar
	const assetsToAssign = assets.slice(0, assets.length - 5);

	const employeeAssets = [];
	const startDate = new Date('2024-01-01');

	assetsToAssign.forEach((asset, index) => {
		const employeeIndex = index % activeEmployees.length;
		const employee = activeEmployees[employeeIndex];

		// Variar las fechas de asignación
		const daysOffset = Math.floor(index / activeEmployees.length) * 30;
		const assignmentDate = new Date(startDate);
		assignmentDate.setDate(assignmentDate.getDate() + daysOffset);

		employeeAssets.push({
			employee_id: employee.id,
			asset_id: asset.id,
			assignment_date: assignmentDate.toISOString().split('T')[0],
			note: `Entregado al empleado en onboarding - ${asset.name}`,
		});
	});

	await EmployeeAsset.bulkCreate(employeeAssets, { individualHooks: true });
};
