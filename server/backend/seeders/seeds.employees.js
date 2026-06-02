const createDepartments = require('./seeds.departments.js');
const createUsers = require('./seeds.users.js');
const { Op } = require('sequelize');

module.exports = async function (sequelize) {
	const { Employee, Person, Department } = sequelize.models;

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

	const HIRE_DATES = [
		'2018-03-12', '2019-07-01', '2020-01-15', '2017-11-20', '2021-06-08',
		'2016-09-05', '2022-02-28', '2019-04-14', '2023-08-01', '2020-10-30',
		'2015-05-19', '2021-12-06', '2018-07-23', '2022-09-15', '2014-03-31',
		'2019-01-10', '2023-04-17', '2020-06-22', '2017-08-09', '2016-11-03',
	];

	const POSITIONS = [
		'Desarrollador Senior', 'Desarrollador Junior', 'Analista de Datos',
		'Diseñador UX/UI', 'Product Manager', 'Scrum Master',
		'Recursos Humanos', 'Contadora', 'Gerente de Operaciones',
		'Soporte Técnico', 'Analista de QA', 'DevOps Engineer',
		'Coordinador de Marketing', 'Analista de Negocios', 'Arquitecto de Software',
		'Líder Técnico', 'Especialista en Seguridad', 'Data Engineer',
		'Administrador de Sistemas', 'Director de Tecnología',
	];

	const employeesData = persons.slice(0, 20).map((person, index) => {
		const department = departments[index % departments.length];
		return {
			person_id:     person.id,
			department_id: department.id,
			position:      POSITIONS[index % POSITIONS.length],
			hire_date:     HIRE_DATES[index % HIRE_DATES.length],
		};
	});

	const createdEmployees = await Employee.bulkCreate(employeesData, { returning: true }, { individualHooks: true });
};
