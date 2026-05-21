const createDepartments = require('./seeds.departments.js');
const createUsers = require('./seeds.users.js');
const { Op } = require('sequelize');

module.exports = async function (sequelize) {
	const { Employee, Person, Role, Department } = sequelize.models;

	await createDepartments(sequelize);

	const count = await Employee.count();
	if (count > 0) {
		return;
	}

	const persons = await Person.findAll({ limit: 20 });
	if (persons.length < 20) {
		throw new Error('seeds.employees.js requires at least 20 Person records before creating 20 Employee records.');
	}


	const departments = await Department.findAll();
	if (departments.length === 0) {
		throw new Error('No departments found; create departments before seeding employees.');
	}

	const employeesData = persons.slice(0, 20).map((person, index) => {

		const department = departments[index % departments.length];
		return {
			person_id: person.id,
			department_id: department.id,
			status: 'ACTIVE',
		};
	});

	const createdEmployees = await Employee.bulkCreate(employeesData, { returning: true });
};
