
const { ContinuousFeedback, Employee, Person, Alert } = require('../connection/sequelize');
const { EMPLOYEE } = require('../utils/constants/models.constants.js');

const formatEmployeeMini = (employee) => {
    if (!employee) return null;

    return {
        id: employee.id,
        firstName: employee.person?.first_name,
        lastName: employee.person?.last_name,
        position: employee.position,
    };
};

const formatContinuousFeedback = (feedback) => ({
    id:          feedback.id,
    type:        feedback.type,
    title:       feedback.title ?? null,
    description: feedback.description,
    isAnonymous: feedback.is_anonymous,
    createdAt:   feedback.createdAt,
    emitter:     feedback.is_anonymous ? null : formatEmployeeMini(feedback.emitter),
    receiver:    formatEmployeeMini(feedback.receiver),
});
const CONTINUOUS_FEEDBACK_INCLUDE = [
    {
        model: Employee,
        as: 'emitter',
        required: false,
        include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
    },
    {
        model: Employee,
        as: 'receiver',
        required: false,
        include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
    },
];
/* ─────────────────────────────────────────────
   CREATE
───────────────────────────────────────────── */

const createContinuousFeedback = async (req, res, next) => {
    try {
        const { type, title, description, emitter_id, receiver_id } = req.body;

        const isAnonymous = type === 'SUGGESTION' ? true : Boolean(req.body.isAnonymous);

        if (emitter_id === receiver_id) {
            return res.status(400).json({
                status: 'error',
                message: 'No podés enviarte feedback a vos mismo.',
            });
        }

        const receiver = await Employee.findByPk(receiver_id);
        if (!receiver || receiver.status !== EMPLOYEE.STATUS_ACTIVE) {
            return res.status(400).json({
                status: 'error',
                message: 'No podés enviarle feedback a un empleado inactivo.',
            });
        }

        const feedback = await ContinuousFeedback.create({
            type,
            title:        title ?? null,
            description,
            emitter_id,
            receiver_id,
            is_anonymous: Boolean(isAnonymous),
        });

        const full = await ContinuousFeedback.findByPk(feedback.id, {
            include: CONTINUOUS_FEEDBACK_INCLUDE,
        });

        // Notify receiver — fire and forget
        const emitterName = isAnonymous
            ? 'Un compañero anónimo'
            : (() => {
                const e = full.emitter;
                return e ? `${e.person?.first_name ?? ''} ${e.person?.last_name ?? ''}`.trim() || 'Un compañero' : 'Un compañero';
            })();
        const typeLabel = type === 'RECOGNITION' ? 'reconocimiento' : 'sugerencia';

        Alert.create({
            employee_id: receiver_id,
            type:        'CONTINUOUS_FEEDBACK_RECEIVED',
            message:     `${emitterName} te envió un ${typeLabel}: "${(title || description).slice(0, 80)}"`,
            status:      'UNREAD',
            topics:      [feedback.id],
        }).catch(console.error);

        res.status(201).json(formatContinuousFeedback(full));

    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   GET ALL
───────────────────────────────────────────── */

const getContinuousFeedbacks = async (req, res, next) => {
    try {
        const feedbacks = await ContinuousFeedback.findAll({
            include: CONTINUOUS_FEEDBACK_INCLUDE,
            order: [['createdAt', 'DESC']],
            subQuery: false,
        });

        res.json(feedbacks.map(formatContinuousFeedback));

    } catch (err) {
        next(err);
    }
};
/* ─────────────────────────────────────────────
   GET BY ID
───────────────────────────────────────────── */
const getContinuousFeedbackById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const feedback = await ContinuousFeedback.findByPk(id, {
            include: CONTINUOUS_FEEDBACK_INCLUDE,
        });

        if (!feedback) {
            return res.status(404).json({
                status: 'error',
                message: 'Feedback no encontrado',
            });
        }

        res.json(formatContinuousFeedback(feedback));

    } catch (err) {
        next(err);
    }
};
/* ─────────────────────────────────────────────
   RECEIVED BY EMPLOYEE
───────────────────────────────────────────── */

const getReceivedFeedbacks = async (req, res, next) => {
    try {
        const { employeeId } = req.params;

        const feedbacks = await ContinuousFeedback.findAll({
            where: { receiver_id: employeeId },
            include: CONTINUOUS_FEEDBACK_INCLUDE,
            order: [['createdAt', 'DESC']],
            subQuery: false,
        });

        res.json(feedbacks.map(formatContinuousFeedback));

    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   SENT BY EMPLOYEE
───────────────────────────────────────────── */

const getSentFeedbacks = async (req, res, next) => {
    try {
        const { employeeId } = req.params;

        const feedbacks = await ContinuousFeedback.findAll({
            where: { emitter_id: employeeId },
            include: CONTINUOUS_FEEDBACK_INCLUDE,
            order: [['createdAt', 'DESC']],
            subQuery: false,
        });

        res.json(feedbacks.map(formatContinuousFeedback));

    } catch (err) {
        next(err);
    }
};

module.exports = {
    createContinuousFeedback,
    getContinuousFeedbacks,
    getReceivedFeedbacks,
    getSentFeedbacks,
    formatContinuousFeedback,
    getContinuousFeedbackById
};
