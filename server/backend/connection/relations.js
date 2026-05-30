const ContinuousFeedback = require("../models/ContinuousFeedback");

const core_conn_apply_associations = (sequelize) => {
	const {
		Department, Employee, EmployeeTask, Person, Question, QuestionOption, QuestionType, Role,
		Survey, SurveyAssignment, SurveyResponse, SurveyType, Task, User, TaskType, Team, ContinuousFeedback,
		Alert, PulseAnalysis, FeedbackAssignment,
	} = sequelize.models;

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
	/* ─────────────────────────────
	   Employee -> emmited feedback
	───────────────────────────── */
	Employee.hasMany(ContinuousFeedback, {
		foreignKey: 'emitter_id',
		as: 'sentFeedbacks',
	});

	ContinuousFeedback.belongsTo(Employee, {
		foreignKey: 'emitter_id',
		as: 'emitter',
	});
	/* ─────────────────────────────
   Employee -> received feedback
───────────────────────────── */

	Employee.hasMany(ContinuousFeedback, {
		foreignKey: 'receiver_id',
		as: 'receivedFeedbacks',
	});

	ContinuousFeedback.belongsTo(Employee, {
		foreignKey: 'receiver_id',
		as: 'receiver',
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
		foreignKey: 'type_id',
		as: 'surveys',
	});

	Survey.belongsTo(SurveyType, {
		foreignKey: 'type_id',
		as: 'surveyType',
	});

	//! QuestionType / Survey (qué preguntas incluye el ciclo) !//
	QuestionType.hasMany(Survey, {
		foreignKey: 'question_type_id',
		as: 'cyclesSurveys',
	});

	Survey.belongsTo(QuestionType, {
		foreignKey: 'question_type_id',
		as: 'questionType',
	});

	//! Department / Survey (ciclos de Feedback 360 por departamento) !//
	Department.hasMany(Survey, {
		foreignKey: 'department_id',
		as: 'feedbackCycles',
	});

	Survey.belongsTo(Department, {
		foreignKey: 'department_id',
		as: 'department',
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

	//! FeedbackAssignment !//
	Survey.hasMany(FeedbackAssignment, { foreignKey: 'cycle_id',     as: 'feedbackAssignments' });
	FeedbackAssignment.belongsTo(Survey,   { foreignKey: 'cycle_id',     as: 'cycle' });

	Employee.hasMany(FeedbackAssignment, { foreignKey: 'evaluator_id', as: 'givenEvaluations' });
	FeedbackAssignment.belongsTo(Employee, { foreignKey: 'evaluator_id', as: 'evaluator' });

	Employee.hasMany(FeedbackAssignment, { foreignKey: 'evaluated_id', as: 'receivedEvaluations' });
	FeedbackAssignment.belongsTo(Employee, { foreignKey: 'evaluated_id', as: 'evaluated' });

	//! PulseAnalysis / SurveyAssignment !//
	SurveyAssignment.hasMany(PulseAnalysis, {
		foreignKey: 'survey_assignment_id',
		as:         'pulseAnalyses',
	});

	PulseAnalysis.belongsTo(SurveyAssignment, {
		foreignKey: 'survey_assignment_id',
		as:         'surveyAssignment',
	});

	//! Alert / Employee !//
	Employee.hasMany(Alert, {
		foreignKey: 'employee_id',
		as: 'alerts',
	});

	Alert.belongsTo(Employee, {
		foreignKey: 'employee_id',
		as: 'employee',
	});

	//! Employee mentor self-association !//
	Employee.belongsTo(Employee, {
		foreignKey: 'mentor_id',
		as: 'mentor',
	});

	Employee.hasMany(Employee, {
		foreignKey: 'mentor_id',
		as: 'mentees',
	});

	//! Team / Employee self-association !//
	Team.belongsTo(Employee, {
		foreignKey: 'leader_id',
		as: 'leader',
	});

	Team.belongsTo(Employee, {
		foreignKey: 'collaborator_id',
		as: 'collaborator',
	});

	Employee.belongsToMany(Employee, {
		through: Team,
		as: 'collaborators',
		foreignKey: 'leader_id',
		otherKey: 'collaborator_id',
	});

	Employee.belongsToMany(Employee, {
		through: Team,
		as: 'leaders',
		foreignKey: 'collaborator_id',
		otherKey: 'leader_id',
	});
};

module.exports = {
	core_conn_apply_associations
};
