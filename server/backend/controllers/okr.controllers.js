
const { Okr, Employee, Person, Alert } = require('../connection/sequelize');
const { OKR, EMPLOYEE } = require('../utils/constants/models.constants.js');
const {
    progressPercent,
    expectedProgressPercent,
    daysRemaining,
    recalculateAndNotify,
} = require('../connection/okrService.js');

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
    id:                      okr.id,
    title:                   okr.title,
    description:             okr.description,
    period:                  okr.period,
    metricType:              okr.metric_type,
    targetValue:             okr.target_value,
    currentValue:            okr.current_value,
    dueDate:                 okr.due_date,
    status:                  okr.status,
    progressPercent:         progressPercent(okr),
    expectedProgressPercent: expectedProgressPercent(okr),
    daysRemaining:           daysRemaining(okr),
    lastProgressUpdateAt:    okr.last_progress_update_at,
    isOverdue:               isOverdue(okr),
    parentId:                okr.parent_id,
    parent:                  okr.parent ? { id: okr.parent.id, title: okr.parent.title } : null,
    children:                Array.isArray(okr.children) ? okr.children.map(formatOkrMini) : [],
    responsible:             formatEmployeeMini(okr.responsible),
    createdAt:               okr.createdAt,
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
        if (responsible.status !== EMPLOYEE.STATUS_ACTIVE) {
            return res.status(400).json({ status: 'error', message: 'No se puede asignar un objetivo a un empleado inactivo.' });
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
            last_progress_update_at: new Date(),
        });

        // Baseline evaluation — covers the edge case of creating an objective
        // that's already at/above its target.
        await recalculateAndNotify(okr);

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
            metricType, targetValue, currentValue, dueDate, parentId,
        } = req.body;

        if (parentId && parentId === req.params.id) {
            return res.status(400).json({ status: 'error', message: 'Un objetivo no puede ser padre de sí mismo.' });
        }

        const reassigned = responsibleEmployeeId !== undefined
            && responsibleEmployeeId !== okr.responsible_employee_id;

        if (reassigned) {
            const newResponsible = await Employee.findByPk(responsibleEmployeeId);
            if (!newResponsible) {
                return res.status(404).json({ status: 'error', message: 'Empleado responsable no encontrado.' });
            }
            if (newResponsible.status !== EMPLOYEE.STATUS_ACTIVE) {
                return res.status(400).json({ status: 'error', message: 'No se puede asignar un objetivo a un empleado inactivo.' });
            }
        }

        const progressChanged = currentValue !== undefined
            && Number(currentValue) !== okr.current_value;

        if (title !== undefined) okr.title = title;
        if (description !== undefined) okr.description = description;
        if (responsibleEmployeeId !== undefined) okr.responsible_employee_id = responsibleEmployeeId;
        if (period !== undefined) okr.period = period;
        if (metricType !== undefined) okr.metric_type = metricType;
        if (targetValue !== undefined) okr.target_value = targetValue;
        if (currentValue !== undefined) okr.current_value = Number(currentValue);
        if (dueDate !== undefined) okr.due_date = dueDate;
        if (parentId !== undefined) okr.parent_id = parentId;

        // Status is fully derived — never set manually. Recalculating here also
        // covers edits to targetValue/dueDate/currentValue that affect evaluation.
        if (progressChanged) okr.last_progress_update_at = new Date();
        await recalculateAndNotify(okr);

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

        okr.current_value          = Number(currentValue);
        okr.last_progress_update_at = new Date();

        // Status evaluation + alert generation (deduped) lives in okrService —
        // the controller only orchestrates the request/response.
        await recalculateAndNotify(okr);

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
