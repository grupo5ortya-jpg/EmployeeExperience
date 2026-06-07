
const { Okr, Employee, Person, Alert } = require('../connection/sequelize');
const { Op } = require('sequelize');
const { OKR } = require('../utils/constants/models.constants.js');

const OKR_INCLUDE = [
    {
        model: Employee,
        as: 'responsible',
        required: false,
        include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
    },
    {
        model: Okr,
        as: 'parent',
        required: false,
        attributes: ['id', 'title'],
    },
    {
        model: Okr,
        as: 'children',
        required: false,
        attributes: ['id', 'title', 'status', 'current_value', 'target_value'],
    },
];

const formatEmployeeMini = (employee) => {
    if (!employee) return null;
    return {
        id:        employee.id,
        firstName: employee.person?.first_name ?? null,
        lastName:  employee.person?.last_name ?? null,
        position:  employee.position,
    };
};

const progressPercent = (okr) => {
    if (!okr.target_value || okr.target_value <= 0) return 0;
    return Math.min(100, Math.round((okr.current_value / okr.target_value) * 100));
};

const isOverdue = (okr) =>
    Boolean(okr.due_date) && new Date(okr.due_date) < new Date() && okr.status !== OKR.STATUS_COMPLETED;

const formatOkrMini = (okr) => ({
    id:             okr.id,
    title:          okr.title,
    status:         okr.status,
    targetValue:    okr.target_value,
    currentValue:   okr.current_value,
    progressPercent: progressPercent(okr),
});

const formatOkr = (okr) => ({
    id:             okr.id,
    title:          okr.title,
    description:    okr.description,
    period:         okr.period,
    metricType:     okr.metric_type,
    targetValue:    okr.target_value,
    currentValue:   okr.current_value,
    dueDate:        okr.due_date,
    status:         okr.status,
    progressPercent: progressPercent(okr),
    isOverdue:      isOverdue(okr),
    parentId:       okr.parent_id,
    parent:         okr.parent ? { id: okr.parent.id, title: okr.parent.title } : null,
    children:       Array.isArray(okr.children) ? okr.children.map(formatOkrMini) : [],
    responsible:    formatEmployeeMini(okr.responsible),
    createdAt:      okr.createdAt,
});

/* ─────────────────────────────────────────────
   LIST (HR — global view)
───────────────────────────────────────────── */
const getOkrs = async (req, res, next) => {
    try {
        const where = {};
        if (req.query.status) where.status = req.query.status;
        if (req.query.period) where.period = req.query.period;
        if (req.query.responsibleEmployeeId) where.responsible_employee_id = req.query.responsibleEmployeeId;
        if (req.query.parentId) where.parent_id = req.query.parentId;

        const okrs = await Okr.findAll({
            where,
            include: OKR_INCLUDE,
            order:   [['createdAt', 'DESC']],
            subQuery: false,
        });

        res.json(okrs.map(formatOkr));
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   MY OBJECTIVES (responsible employee)
───────────────────────────────────────────── */
const getMyOkrs = async (req, res, next) => {
    try {
        const { employeeId } = req.query;
        if (!employeeId) {
            return res.status(400).json({ status: 'error', message: 'employeeId es requerido.' });
        }

        const okrs = await Okr.findAll({
            where:   { responsible_employee_id: employeeId },
            include: OKR_INCLUDE,
            order:   [['createdAt', 'DESC']],
            subQuery: false,
        });

        res.json(okrs.map(formatOkr));
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   GET BY ID
───────────────────────────────────────────── */
const getOkrById = async (req, res, next) => {
    try {
        const okr = await Okr.findByPk(req.params.id, { include: OKR_INCLUDE });

        if (!okr) {
            return res.status(404).json({ status: 'error', message: 'Objetivo no encontrado.' });
        }

        res.json(formatOkr(okr));
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   CREATE (HR)
───────────────────────────────────────────── */
const createOkr = async (req, res, next) => {
    try {
        const {
            title, description, responsibleEmployeeId, period,
            metricType, targetValue, currentValue, dueDate, parentId,
        } = req.body;

        if (!title || !responsibleEmployeeId || !period || !metricType || targetValue == null) {
            return res.status(400).json({
                status: 'error',
                message: 'title, responsibleEmployeeId, period, metricType y targetValue son requeridos.',
            });
        }

        const responsible = await Employee.findByPk(responsibleEmployeeId);
        if (!responsible) {
            return res.status(404).json({ status: 'error', message: 'Empleado responsable no encontrado.' });
        }

        if (parentId) {
            const parent = await Okr.findByPk(parentId);
            if (!parent) {
                return res.status(404).json({ status: 'error', message: 'Objetivo padre no encontrado.' });
            }
        }

        const okr = await Okr.create({
            title,
            description:             description ?? null,
            responsible_employee_id: responsibleEmployeeId,
            period,
            metric_type:             metricType,
            target_value:            targetValue,
            current_value:           currentValue ?? 0,
            due_date:                dueDate ?? null,
            parent_id:               parentId ?? null,
        });

        const full = await Okr.findByPk(okr.id, { include: OKR_INCLUDE });

        // Notify the responsible employee — simple, fire-and-forget
        Alert.create({
            employee_id: okr.responsible_employee_id,
            type:        'OKR_ASSIGNED',
            message:     `Se te asignó un nuevo objetivo: "${okr.title}".`,
            status:      'UNREAD',
            topics:      [okr.id],
        }).catch(console.error);

        res.status(201).json(formatOkr(full));
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   UPDATE (HR — edit fields, reassign responsible/parent)
───────────────────────────────────────────── */
const updateOkr = async (req, res, next) => {
    try {
        const okr = await Okr.findByPk(req.params.id);
        if (!okr) {
            return res.status(404).json({ status: 'error', message: 'Objetivo no encontrado.' });
        }

        const {
            title, description, responsibleEmployeeId, period,
            metricType, targetValue, currentValue, dueDate, parentId, status,
        } = req.body;

        if (parentId && parentId === req.params.id) {
            return res.status(400).json({ status: 'error', message: 'Un objetivo no puede ser padre de sí mismo.' });
        }

        const reassigned = responsibleEmployeeId !== undefined
            && responsibleEmployeeId !== okr.responsible_employee_id;

        if (title !== undefined) okr.title = title;
        if (description !== undefined) okr.description = description;
        if (responsibleEmployeeId !== undefined) okr.responsible_employee_id = responsibleEmployeeId;
        if (period !== undefined) okr.period = period;
        if (metricType !== undefined) okr.metric_type = metricType;
        if (targetValue !== undefined) okr.target_value = targetValue;
        if (currentValue !== undefined) okr.current_value = currentValue;
        if (dueDate !== undefined) okr.due_date = dueDate;
        if (parentId !== undefined) okr.parent_id = parentId;
        if (status !== undefined) okr.status = status;

        await okr.save();

        // Notify the newly-assigned responsible employee — simple, fire-and-forget
        if (reassigned) {
            Alert.create({
                employee_id: okr.responsible_employee_id,
                type:        'OKR_ASSIGNED',
                message:     `Se te asignó el objetivo: "${okr.title}".`,
                status:      'UNREAD',
                topics:      [okr.id],
            }).catch(console.error);
        }

        const full = await Okr.findByPk(okr.id, { include: OKR_INCLUDE });
        res.json(formatOkr(full));
    } catch (err) {
        next(err);
    }
};

/* ─────────────────────────────────────────────
   UPDATE PROGRESS (responsible employee)
───────────────────────────────────────────── */
const updateOkrProgress = async (req, res, next) => {
    try {
        const okr = await Okr.findByPk(req.params.id);
        if (!okr) {
            return res.status(404).json({ status: 'error', message: 'Objetivo no encontrado.' });
        }

        const { currentValue } = req.body;
        if (currentValue == null || Number.isNaN(Number(currentValue))) {
            return res.status(400).json({ status: 'error', message: 'currentValue es requerido.' });
        }

        okr.current_value = Number(currentValue);

        const reachedTarget = okr.current_value >= okr.target_value;
        const overdue       = Boolean(okr.due_date) && new Date(okr.due_date) < new Date();

        if (reachedTarget) {
            okr.status = OKR.STATUS_COMPLETED;
        } else if (overdue) {
            okr.status = OKR.STATUS_AT_RISK;
        } else if (okr.current_value > 0) {
            okr.status = OKR.STATUS_IN_PROGRESS;
        }

        await okr.save();

        // Completion notification for HR — simple, deduped per OKR
        if (okr.status === OKR.STATUS_COMPLETED) {
            const alreadyNotified = await Alert.findOne({
                where: {
                    employee_id: okr.responsible_employee_id,
                    type:        'OKR_COMPLETED',
                    topics:      { [Op.contains]: [okr.id] },
                },
            });

            if (!alreadyNotified) {
                Alert.create({
                    employee_id: okr.responsible_employee_id,
                    type:        'OKR_COMPLETED',
                    message:     `El objetivo "${okr.title}" alcanzó su meta y fue marcado como completado.`,
                    status:      'UNREAD',
                    topics:      [okr.id],
                }).catch(console.error);
            }
        }

        // Behind-schedule notification — simple, deduped per OKR
        if (okr.status === OKR.STATUS_AT_RISK) {
            const alreadyAlerted = await Alert.findOne({
                where: {
                    employee_id: okr.responsible_employee_id,
                    type:        'OKR_BEHIND_SCHEDULE',
                    topics:      { [Op.contains]: [okr.id] },
                },
            });

            if (!alreadyAlerted) {
                Alert.create({
                    employee_id: okr.responsible_employee_id,
                    type:        'OKR_BEHIND_SCHEDULE',
                    message:     `El objetivo "${okr.title}" está retrasado respecto a su fecha límite.`,
                    status:      'UNREAD',
                    topics:      [okr.id],
                }).catch(console.error);
            }
        }

        const full = await Okr.findByPk(okr.id, { include: OKR_INCLUDE });
        res.json(formatOkr(full));
    } catch (err) {
        next(err);
    }
};

module.exports = {
    getOkrs,
    getMyOkrs,
    getOkrById,
    createOkr,
    updateOkr,
    updateOkrProgress,
};
