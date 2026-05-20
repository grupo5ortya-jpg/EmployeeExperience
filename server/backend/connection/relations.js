
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const EmployeeTask = require('../models/EmployeeTask');
const Person = require('../models/Person');
const Question = require('../models/Question');
const QuestionOption = require('../models/QuestionOption');
const QuestionType = require('../models/QuestionType');
const Role = require('../models/Role');
const Survey = require('../models/Survey');
const SurveyAssignment = require('../models/SurveyAssignment');
const SurveyResponse = require('../models/SurveyResponse');
const SurveyType = require('../models/SurveyType');
const Task = require('../models/Task');
const User = require('../models/User');
const TaskType = require('../models/TaskType');
const Team = require('../models/Team');

async function core_conn_apply_associations() {

	//! Department !//
		Department.hasMany(Employee, {
			foreignKey: 'department_id',
			as: 'employees',
		});

		Employee.belongsTo(Department, {
			foreignKey: 'department_id',
			as: 'department',
		});

	//! Person / Employee !//
		Person.hasOne(Employee, {
			foreignKey: 'person_id',
			as: 'employee',
		});

		Employee.belongsTo(Person, {
			foreignKey: 'person_id',
			as: 'person',
		});

	//! Role / User !//
		Role.hasMany(User, {
			foreignKey: 'role_id',
			as: 'users',
		});

		User.belongsTo(Role, {
			foreignKey: 'role_id',
			as: 'role',
		});

	//! Employee / User !//
		Employee.hasOne(User, {
			foreignKey: 'employee_id',
			as: 'user',
		});

		User.belongsTo(Employee, {
			foreignKey: 'employee_id',
			as: 'employee',
		});

	//! TaskType / Task !//
		TaskType.hasMany(Task, {
			foreignKey: 'task_type_id',
			as: 'tasks',
		});

		Task.belongsTo(TaskType, {
			foreignKey: 'task_type_id',
			as: 'taskType',
		});

	//! Employee / Task !//
		Employee.belongsToMany(Task, {
			through: EmployeeTask,
			foreignKey: 'employee_id',
			otherKey: 'task_id',
			as: 'tasks',
		});

		Task.belongsToMany(Employee, {
			through: EmployeeTask,
			foreignKey: 'task_id',
			otherKey: 'employee_id',
			as: 'employees',
		});

	//! EmployeeTask relations !//
		EmployeeTask.belongsTo(Employee, {
			foreignKey: 'employee_id',
			as: 'employee',
		});

		Employee.hasMany(EmployeeTask, {
			foreignKey: 'employee_id',
			as: 'employeeTasks',
		});

		EmployeeTask.belongsTo(Task, {
			foreignKey: 'task_id',
			as: 'task',
		});

		Task.hasMany(EmployeeTask, {
			foreignKey: 'task_id',
			as: 'employeeTasks',
		});

	//! QuestionType / Question !//
		QuestionType.hasMany(Question, {
			foreignKey: 'question_type_id',
			as: 'questions',
		});

		Question.belongsTo(QuestionType, {
			foreignKey: 'question_type_id',
			as: 'questionType',
		});

	//! Question / QuestionOption !//
		Question.hasMany(QuestionOption, {
			foreignKey: 'question_id',
			as: 'options',
			onDelete: 'CASCADE',
		});

		QuestionOption.belongsTo(Question, {
			foreignKey: 'question_id',
			as: 'question',
		});

	//! SurveyType / Survey !//
		SurveyType.hasMany(Survey, {
			foreignKey: 'survey_type_id',
			as: 'surveys',
		});

		Survey.belongsTo(SurveyType, {
			foreignKey: 'survey_type_id',
			as: 'surveyType',
		});

	//! Survey / SurveyAssignment !//
		Survey.hasMany(SurveyAssignment, {
			foreignKey: 'survey_id',
			as: 'assignments',
		});

		SurveyAssignment.belongsTo(Survey, {
			foreignKey: 'survey_id',
			as: 'survey',
		});

	//! Employee / SurveyAssignment !//
		Employee.hasMany(SurveyAssignment, {
			foreignKey: 'employee_id',
			as: 'surveyAssignments',
		});

		SurveyAssignment.belongsTo(Employee, {
			foreignKey: 'employee_id',
			as: 'employee',
		});


	//! SurveyAssignment / SurveyResponse !//
		SurveyAssignment.hasMany(SurveyResponse, {
			foreignKey: 'survey_assignment_id',
			as: 'responses',
			onDelete: 'CASCADE',
		});

		SurveyResponse.belongsTo(SurveyAssignment, {
			foreignKey: 'survey_assignment_id',
			as: 'surveyAssignment',
		});

	//! Question / SurveyResponse !//
		Question.hasMany(SurveyResponse, {
			foreignKey: 'question_id',
			as: 'responses',
		});

		SurveyResponse.belongsTo(Question, {
			foreignKey: 'question_id',
			as: 'question',
		});


	//! QuestionOption / SurveyResponse !//
		QuestionOption.hasMany(SurveyResponse, {
			foreignKey: 'question_option_id',
			as: 'responses',
		});

		SurveyResponse.belongsTo(QuestionOption, {
			foreignKey: 'question_option_id',
			as: 'selectedOption',
		});

		//! Team / Employee !//
		Team.hasMany(Employee, {
			foreignKey: 'leader_id',
			as: 'members',
		});
};


module.exports = {
	core_conn_apply_associations
};