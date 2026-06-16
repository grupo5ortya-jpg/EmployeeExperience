
const { TaskType, QuestionType } = require('../connection/sequelize');
const { OFFBOARDING } = require('./constants/models.constants.js');

// TaskType "Offboarding estándad"/Checklist — ya seedeada (ver seeds.tasks.js), se reusa siempre la misma.
// Filtra por name + sub_type porque "Onboarding estándar" también tiene sub_type 'Checklist'.
async function getOffboardingChecklistTaskType() {
	const [taskType] = await TaskType.findOrCreate({
		where:    { name: OFFBOARDING.CHECKLIST_TASK_TYPE.name, sub_type: OFFBOARDING.CHECKLIST_TASK_TYPE.sub_type },
		defaults: OFFBOARDING.CHECKLIST_TASK_TYPE,
	});
	return taskType;
}

// QuestionType "Offboarding"/"Salida" — ya seedeada (ver seeds.question_types.js), se reusa siempre la misma
async function getExitInterviewQuestionType() {
	const [questionType] = await QuestionType.findOrCreate({
		where:    { name: OFFBOARDING.EXIT_INTERVIEW_QUESTION_TYPE.name, sub_type: OFFBOARDING.EXIT_INTERVIEW_QUESTION_TYPE.sub_type },
		defaults: OFFBOARDING.EXIT_INTERVIEW_QUESTION_TYPE,
	});
	return questionType;
}

module.exports = { getOffboardingChecklistTaskType, getExitInterviewQuestionType };
