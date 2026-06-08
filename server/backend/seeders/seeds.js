
const core_seed_create_roles = require('./seeds.roles.js');
const core_seed_create_persons = require('./seeds.persons.js');
const core_seed_create_departments = require('./seeds.departments.js');
const core_seed_create_task_types = require('./seeds.task_types.js');
const core_seed_create_tasks = require('./seeds.tasks.js');
const core_seed_create_employees = require('./seeds.employees.js');
const core_seed_create_users = require('./seeds.users.js');
const core_seed_create_teams = require('./seeds.teams.js');
const core_seed_create_question_types = require('./seeds.question_types.js');
const core_seed_create_questions = require('./seeds.questions.js');
const core_seed_create_employee_tasks = require('./seeds.employee_tasks.js');
const core_seed_create_assets = require('./seeds.assets.js');
const core_seed_create_employee_assets = require('./seeds.employee_assets.js');
const core_seed_create_pulse_demo = require('./seeds.pulse_demo.js');
const core_seed_create_job_openings = require('./seeds.job_openings.js')
const core_seed_create_job_openings_skils = require('./seeds.job_openings_skills.js')
const core_seed_create_skills = require('./seeds.skills.js')
const core_seed_create_learning_courses = require('./seeds.learning_courses.js')


module.exports = async function (sequelize) {
	try {
		await core_seed_create_roles(sequelize);
		await core_seed_create_departments(sequelize);
		await core_seed_create_question_types(sequelize);
		await core_seed_create_questions(sequelize);
		await core_seed_create_persons(sequelize);
		await core_seed_create_task_types(sequelize);
		await core_seed_create_tasks(sequelize);

		await core_seed_create_employees(sequelize);

		const roleNames = ['Talento', 'Talento', 'Alumni', 'Alumni', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Colaborador', 'Líder', 'Líder', 'Líder', 'Líder', 'Colaborador', 'Talento'];
		const employees = await sequelize.models.Employee.findAll({ limit: 20 });
		await core_seed_create_users(sequelize, employees, roleNames);
		await core_seed_create_teams(sequelize);
		await core_seed_create_employee_tasks(sequelize);
		await core_seed_create_assets(sequelize);
		await core_seed_create_employee_assets(sequelize);

		await core_seed_create_pulse_demo(sequelize);
		await core_seed_create_skills(sequelize);
		await core_seed_create_job_openings(sequelize);
		await core_seed_create_job_openings_skils(sequelize);
		await core_seed_create_learning_courses(sequelize);
		console.log('Database seeded successfully');
	} catch (error) {
		console.error('Error seeding database:', error);
		throw error;
	}
};
