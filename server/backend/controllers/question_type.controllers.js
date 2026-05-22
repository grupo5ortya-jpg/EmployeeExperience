const { QuestionType } = require('../connection/sequelize');

function formatQuestionType(qt) {
	return {
		id:      qt.id,
		name:    qt.name,
		subType: qt.sub_type ?? null,
	};
}

const getAllQuestionTypes = async (req, res, next) => {
	try {
		const questionTypes = await QuestionType.findAll();
		res.json(questionTypes.map(formatQuestionType));
	} catch (err) {
		next(err);
	}
};

const getQuestionTypeById = async (req, res, next) => {
	try {
		const questionType = await QuestionType.findByPk(req.params.id);
		if (!questionType) return res.status(404).json({ status: 'fail', message: 'Question type not found' });
		res.json(formatQuestionType(questionType));
	} catch (err) {
		next(err);
	}
};

const createQuestionType = async (req, res, next) => {
	try {
		const { name, subType } = req.body;
		const questionType = await QuestionType.create({ name, sub_type: subType || null });
		res.status(201).json(formatQuestionType(questionType));
	} catch (err) {
		next(err);
	}
};

const updateQuestionType = async (req, res, next) => {
	try {
		const questionType = await QuestionType.findByPk(req.params.id);
		if (!questionType) return res.status(404).json({ status: 'fail', message: 'Question type not found' });

		const { name, subType } = req.body;
		const updates = {};
		if (name    !== undefined) updates.name     = name;
		if (subType !== undefined) updates.sub_type = subType || null;

		await questionType.update(updates);
		res.json(formatQuestionType(questionType));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → soft delete
const deleteQuestionType = async (req, res, next) => {
	try {
		const questionType = await QuestionType.findByPk(req.params.id);
		if (!questionType) return res.status(404).json({ status: 'fail', message: 'Question type not found' });
		await questionType.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllQuestionTypes,
	getQuestionTypeById,
	createQuestionType,
	updateQuestionType,
	deleteQuestionType,
};
