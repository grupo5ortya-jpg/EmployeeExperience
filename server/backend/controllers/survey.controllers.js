const { Survey, SurveyType } = require('../connection/sequelize');

const SURVEY_INCLUDE = [
	{ model: SurveyType, as: 'surveyType', attributes: ['id', 'name', 'sub_type'] },
];

function formatSurvey(s) {
	return {
		id:         s.id,
		name:       s.name,
		surveyType: s.surveyType ?? null,
	};
}

const getAllSurveys = async (req, res, next) => {
	try {
		const surveys = await Survey.findAll({ include: SURVEY_INCLUDE });
		res.json(surveys.map(formatSurvey));
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
		const { name, surveyTypeId } = req.body;
		const survey = await Survey.create({ name, type_id: surveyTypeId });
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

		const { name, surveyTypeId } = req.body;
		const updates = {};
		if (name         !== undefined) updates.name    = name;
		if (surveyTypeId !== undefined) updates.type_id = surveyTypeId;

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
