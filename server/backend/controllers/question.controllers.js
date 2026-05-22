const { Question, QuestionType, QuestionOption } = require('../connection/sequelize');

const QUESTION_INCLUDE = [
	{ model: QuestionType,   as: 'questionType', attributes: ['id', 'name', 'sub_type'] },
	{ model: QuestionOption, as: 'options',       attributes: ['id', 'label', 'value', 'order'], order: [['order', 'ASC']] },
];

function formatQuestion(q) {
	return {
		id:                q.id,
		text:              q.text,
		type:              q.type,
		estimatedDuration: q.estimated_duration ?? null,
		createdAt:         q.createdAt,
		updatedAt:         q.updatedAt,
		questionType:      q.questionType ?? null,
		options:           q.options      ?? [],
	};
}

const getAllQuestions = async (req, res, next) => {
	try {
		const questions = await Question.findAll({ include: QUESTION_INCLUDE });
		res.json(questions.map(formatQuestion));
	} catch (err) {
		next(err);
	}
};

const getQuestionById = async (req, res, next) => {
	try {
		const question = await Question.findByPk(req.params.id, { include: QUESTION_INCLUDE });
		if (!question) return res.status(404).json({ status: 'fail', message: 'Question not found' });
		res.json(formatQuestion(question));
	} catch (err) {
		next(err);
	}
};

const createQuestion = async (req, res, next) => {
	try {
		const { text, type, questionTypeId, estimatedDuration } = req.body;
		const question = await Question.create({
			text,
			type,
			question_type_id:   questionTypeId,
			estimated_duration: estimatedDuration ?? null,
		});
		const full = await Question.findByPk(question.id, { include: QUESTION_INCLUDE });
		res.status(201).json(formatQuestion(full));
	} catch (err) {
		next(err);
	}
};

const updateQuestion = async (req, res, next) => {
	try {
		const question = await Question.findByPk(req.params.id);
		if (!question) return res.status(404).json({ status: 'fail', message: 'Question not found' });

		const { text, type, questionTypeId, estimatedDuration } = req.body;
		const updates = {};
		if (text              !== undefined) updates.text               = text;
		if (type              !== undefined) updates.type               = type;
		if (questionTypeId    !== undefined) updates.question_type_id   = questionTypeId;
		if (estimatedDuration !== undefined) updates.estimated_duration = estimatedDuration ?? null;

		await question.update(updates);
		const updated = await Question.findByPk(question.id, { include: QUESTION_INCLUDE });
		res.json(formatQuestion(updated));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → soft delete
const deleteQuestion = async (req, res, next) => {
	try {
		const question = await Question.findByPk(req.params.id);
		if (!question) return res.status(404).json({ status: 'fail', message: 'Question not found' });
		await question.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllQuestions,
	getQuestionById,
	createQuestion,
	updateQuestion,
	deleteQuestion,
};
