const { QuestionOption, Question } = require('../connection/sequelize');

function formatOption(o) {
	return {
		id:         o.id,
		questionId: o.question_id,
		label:      o.label,
		value:      o.value ?? null,
		order:      o.order,
	};
}

const getAllOptions = async (req, res, next) => {
	try {
		const options = await QuestionOption.findAll({ order: [['order', 'ASC']] });
		res.json(options.map(formatOption));
	} catch (err) {
		next(err);
	}
};

const getOptionById = async (req, res, next) => {
	try {
		const option = await QuestionOption.findByPk(req.params.id);
		if (!option) return res.status(404).json({ status: 'fail', message: 'Question option not found' });
		res.json(formatOption(option));
	} catch (err) {
		next(err);
	}
};

const createOption = async (req, res, next) => {
	try {
		const { questionId, label, value, order } = req.body;

		const question = await Question.findByPk(questionId);
		if (!question) return res.status(404).json({ status: 'fail', message: 'Question not found' });

		const option = await QuestionOption.create({
			question_id: questionId,
			label,
			value: value ?? null,
			order: order ?? 0,
		});
		res.status(201).json(formatOption(option));
	} catch (err) {
		next(err);
	}
};

const updateOption = async (req, res, next) => {
	try {
		const option = await QuestionOption.findByPk(req.params.id);
		if (!option) return res.status(404).json({ status: 'fail', message: 'Question option not found' });

		const { label, value, order } = req.body;
		const updates = {};
		if (label !== undefined) updates.label = label;
		if (value !== undefined) updates.value = value ?? null;
		if (order !== undefined) updates.order = order;

		await option.update(updates);
		res.json(formatOption(option));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → soft delete
const deleteOption = async (req, res, next) => {
	try {
		const option = await QuestionOption.findByPk(req.params.id);
		if (!option) return res.status(404).json({ status: 'fail', message: 'Question option not found' });
		await option.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllOptions,
	getOptionById,
	createOption,
	updateOption,
	deleteOption,
};
