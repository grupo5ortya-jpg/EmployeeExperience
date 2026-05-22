const { SurveyType } = require('../connection/sequelize');

function formatSurveyType(st) {
	return {
		id:      st.id,
		name:    st.name,
		subType: st.sub_type ?? null,
	};
}

const getAllSurveyTypes = async (req, res, next) => {
	try {
		const surveyTypes = await SurveyType.findAll();
		res.json(surveyTypes.map(formatSurveyType));
	} catch (err) {
		next(err);
	}
};

const getSurveyTypeById = async (req, res, next) => {
	try {
		const surveyType = await SurveyType.findByPk(req.params.id);
		if (!surveyType) return res.status(404).json({ status: 'fail', message: 'Survey type not found' });
		res.json(formatSurveyType(surveyType));
	} catch (err) {
		next(err);
	}
};

const createSurveyType = async (req, res, next) => {
	try {
		const { name, subType } = req.body;
		const surveyType = await SurveyType.create({ name, sub_type: subType || null });
		res.status(201).json(formatSurveyType(surveyType));
	} catch (err) {
		next(err);
	}
};

const updateSurveyType = async (req, res, next) => {
	try {
		const surveyType = await SurveyType.findByPk(req.params.id);
		if (!surveyType) return res.status(404).json({ status: 'fail', message: 'Survey type not found' });

		const { name, subType } = req.body;
		const updates = {};
		if (name    !== undefined) updates.name     = name;
		if (subType !== undefined) updates.sub_type = subType || null;

		await surveyType.update(updates);
		res.json(formatSurveyType(surveyType));
	} catch (err) {
		next(err);
	}
};

const deleteSurveyType = async (req, res, next) => {
	try {
		const surveyType = await SurveyType.findByPk(req.params.id);
		if (!surveyType) return res.status(404).json({ status: 'fail', message: 'Survey type not found' });
		await surveyType.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllSurveyTypes,
	getSurveyTypeById,
	createSurveyType,
	updateSurveyType,
	deleteSurveyType,
};
