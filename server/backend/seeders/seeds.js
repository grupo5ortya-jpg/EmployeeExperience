
const createRoles = require('./seeds.roles.js');
const createPersons = require('./seeds.persons.js');
const createDepartments = require('./seeds.departments.js');
const createTaskTypes = require('./seeds.task_types.js');
const createTasks = require('./seeds.tasks.js');
const createEmployees = require('./seeds.employees.js');
const createUsers = require('./seeds.users.js');
const createTeams = require('./seeds.teams.js');
const createQuestionTypes = require('./seeds.question_types.js');
const createQuestions = require('./seeds.questions.js');
const createEmployeeTasks = require('./seeds.employee_tasks.js');


module.exports = async function (sequelize) {
	try {
		await createRoles(sequelize);
		await createDepartments(sequelize);
		await createQuestionTypes(sequelize);
		await createQuestions(sequelize);
		await createPersons(sequelize);
		await createTaskTypes(sequelize);
		await createTasks(sequelize);

		await createEmployees(sequelize);

		const roleNames = [ 'Talento', 'Talento', 'Alumni', 'Alumni', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Líder', 'Líder', 'Líder', 'Líder', 'Colaborador', 'Talento'];
		const employees = await sequelize.models.Employee.findAll({ limit: 20 });
		await createUsers(sequelize, employees, roleNames);
		await createTeams(sequelize);
		await createEmployeeTasks(sequelize);

		console.log('Database seeded successfully');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
};
