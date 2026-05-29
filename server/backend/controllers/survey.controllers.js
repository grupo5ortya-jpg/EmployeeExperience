const { Survey, SurveyType, QuestionType, Question, QuestionOption, Department } = require('../connection/sequelize');

const SURVEY_INCLUDE = [
	{
		model:      SurveyType,
		as:         'surveyType',
		attributes: ['id', 'name', 'sub_type'],
		required:   false,
	},
	{
		model:      QuestionType,
		as:         'questionType',
		attributes: ['id', 'name', 'sub_type'],
		required:   false,
		include: [{
			model:      Question,
			as:         'questions',
			attributes: ['id', 'text', 'type', 'estimated_duration'],
			required:   false,
			include: [{
				model:      QuestionOption,
				as:         'options',
				attributes: ['id', 'label', 'value', 'order'],
			}],
		}],
	},
	{
		model:      Department,
		as:         'department',
		attributes: ['id', 'name'],
		required:   false,
	},
];

function formatSurvey(s) {
	return {
		id:          s.id,
		name:        s.name,
		description: s.description  ?? null,
		startDate:   s.start_date   ?? null,
		endDate:     s.end_date     ?? null,
		minAnonymousResponses: s.min_anonymous_responses ?? null,
		competencies: s.competencies ?? [],
		// relaciones
		surveyType:   s.surveyType   ?? null,
		questionType: s.questionType
			? {
				id:      s.questionType.id,
				name:    s.questionType.name,
				subType: s.questionType.sub_type ?? null,
			}
			: null,
		department: s.department
			? { id: s.department.id, name: s.department.name }
			: null,
		questions: (s.questionType?.questions ?? []).map((q) => ({
			id:                q.id,
			text:              q.text,
			type:              q.type,
			estimatedDuration: q.estimated_duration ?? null,
			options:           (q.options ?? [])
				.slice()
				.sort((a, b) => a.order - b.order)
				.map((o) => ({ id: o.id, label: o.label, value: o.value, order: o.order })),
		})),
	};
}

const getAllSurveys = async (req, res, next) => {
	try {
		const surveys = await Survey.findAll({ include: SURVEY_INCLUDE });
		// Exclude pulse surveys — those are managed separately via /pulse-surveys
		const feedback = surveys.filter((s) => s.questionType?.name !== 'Pulso');
		res.json(feedback.map(formatSurvey));
	} catch (err) {
		next(err);
	}
};

const getSurveyById = async (req, res, next) => {
	try {
		const survey = await Survey.findByPk(req.params.id, { include: SURVEY_INCLUDE });
		if (!survey) return res.status(404).json({ status: 'fail', message: 'Survey not found' });
		res.json(formatSurvey(survey));
	} catch (err) {
		next(err);
	}
};

const createSurvey = async (req, res, next) => {
	try {
		const {
			name,
			surveyTypeId,
			questionTypeId,
			departmentId,
			startDate,
			endDate,
			description,
			minAnonymousResponses,
			competencies,
		} = req.body;

		const survey = await Survey.create({
			name,
			type_id:                  surveyTypeId          || null,
			question_type_id:         questionTypeId        || null,
			department_id:            departmentId          || null,
			start_date:               startDate             || null,
			end_date:                 endDate               || null,
			description:              description           || null,
			min_anonymous_responses:  minAnonymousResponses ?? null,
			competencies:             competencies          ?? [],
		});
		const full = await Survey.findByPk(survey.id, { include: SURVEY_INCLUDE });
		res.status(201).json(formatSurvey(full));
	} catch (err) {
		next(err);
	}
};

const updateSurvey = async (req, res, next) => {
	try {
		const survey = await Survey.findByPk(req.params.id);
		if (!survey) return res.status(404).json({ status: 'fail', message: 'Survey not found' });

		const {
			name,
			surveyTypeId,
			questionTypeId,
			departmentId,
			startDate,
			endDate,
			description,
			minAnonymousResponses,
			competencies,
		} = req.body;

		const updates = {};
		if (name                 !== undefined) updates.name                    = name;
		if (surveyTypeId         !== undefined) updates.type_id                 = surveyTypeId         || null;
		if (questionTypeId       !== undefined) updates.question_type_id        = questionTypeId       || null;
		if (departmentId         !== undefined) updates.department_id           = departmentId         || null;
		if (startDate            !== undefined) updates.start_date              = startDate            || null;
		if (endDate              !== undefined) updates.end_date                = endDate              || null;
		if (description          !== undefined) updates.description             = description          || null;
		if (minAnonymousResponses !== undefined) updates.min_anonymous_responses = minAnonymousResponses ?? null;
		if (competencies         !== undefined) updates.competencies            = competencies;

		await survey.update(updates);
		const updated = await Survey.findByPk(survey.id, { include: SURVEY_INCLUDE });
		res.json(formatSurvey(updated));
	} catch (err) {
		next(err);
	}
};

const deleteSurvey = async (req, res, next) => {
	try {
		const survey = await Survey.findByPk(req.params.id);
		if (!survey) return res.status(404).json({ status: 'fail', message: 'Survey not found' });
		await survey.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllSurveys,
	getSurveyById,
	createSurvey,
	updateSurvey,
	deleteSurvey,
};
