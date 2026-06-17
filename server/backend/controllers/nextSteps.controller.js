
const { Op }                   = require('sequelize');
const {
    EmployeeTask, Task, TaskType,
    FeedbackAssignment, Survey,
    CareerPlan,
    FeedbackGapAnalysis,
    Okr,
} = require('../connection/sequelize');
const {
    EMPLOYEE_TASK,
    FEEDBACK_ASSIGNMENT,
    OKR,
} = require('../utils/constants/models.constants');

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function assertSelfOrTalento(req, employeeId) {
    if (req.user.role !== 'Talento' && req.user.employeeId !== employeeId) {
        const err = new Error('Solo podés acceder a tus propios próximos pasos.');
        err.status = 403;
        throw err;
    }
}

/* ── GET /next-steps?employeeId=X ──────────────────────────────── */
async function getNextSteps(req, res, next) {
    try {
        const { employeeId } = req.query;
        if (!employeeId) return res.status(400).json({ error: 'employeeId es requerido.' });

        assertSelfOrTalento(req, employeeId);

        const today = new Date();
        const items = [];

        /* 1. Overdue tasks (max 2, skip Learning courses) */
        const overdueTasks = await EmployeeTask.findAll({
            where: {
                employee_id: employeeId,
                status: {
                    [Op.notIn]: [
                        EMPLOYEE_TASK.STATUS_COMPLETED,
                        EMPLOYEE_TASK.STATUS_DROPPED,
                        EMPLOYEE_TASK.STATUS_REJECTED,
                        EMPLOYEE_TASK.STATUS_SUBMITTED,
                    ],
                },
                due_date: { [Op.lt]: today },
            },
            include: [{
                model: Task,
                as: 'task',
                attributes: ['name'],
                include: [{ model: TaskType, as: 'taskType', attributes: ['sub_type'] }],
            }],
            order: [['due_date', 'ASC']],
            limit: 3,
        });

        for (const et of overdueTasks) {
            if (items.filter((i) => i.type === 'overdue_task').length >= 2) break;
            if (et.task?.taskType?.sub_type === 'Curso') continue;
            items.push({
                type:        'overdue_task',
                label:       `Tarea vencida: ${et.task?.name ?? 'Tarea'}`,
                description: `Venció el ${new Date(et.due_date).toLocaleDateString('es-AR')} — completala o consultá con tu líder.`,
                link:        '/mytasks',
            });
        }

        /* 2. Pending Feedback 360° as evaluator (max 1) */
        const [pendingFeedback, pendingCount] = await Promise.all([
            FeedbackAssignment.findOne({
                where: {
                    evaluator_id: employeeId,
                    status:       FEEDBACK_ASSIGNMENT.STATUS_PENDING,
                    type:         { [Op.ne]: 'SELF' },
                },
                include: [{ model: Survey, as: 'cycle', attributes: ['name'] }],
            }),
            FeedbackAssignment.count({
                where: {
                    evaluator_id: employeeId,
                    status:       FEEDBACK_ASSIGNMENT.STATUS_PENDING,
                    type:         { [Op.ne]: 'SELF' },
                },
            }),
        ]);

        if (pendingFeedback) {
            const cycleName = pendingFeedback.cycle?.name ?? 'ciclo actual';
            items.push({
                type:        'pending_feedback',
                label:       'Feedback 360° pendiente',
                description: pendingCount === 1
                    ? `Tenés una evaluación pendiente en el ciclo "${cycleName}".`
                    : `Tenés ${pendingCount} evaluaciones pendientes en el ciclo "${cycleName}".`,
                link:        '/myevaluations',
            });
        }

        /* 3. Top action from active CareerPlan (max 1) */
        const activePlan = await CareerPlan.findOne({
            where: { employee_id: employeeId },
            order: [['generated_at', 'DESC']],
        });

        if (activePlan) {
            const actions    = activePlan.plan?.actions ?? [];
            const sortedActions = [...actions].sort(
                (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3),
            );
            const top = sortedActions[0];
            if (top) {
                items.push({
                    type:        'career_action',
                    label:       top.title,
                    description: top.description,
                    link:        '/career-simulator',
                });
            }
        }

        /* 4. Top FeedbackGapAnalysis suggestion (max 1) */
        const latestGap = await FeedbackGapAnalysis.findOne({
            where: { employee_id: employeeId },
            order: [['createdAt', 'DESC']],
        });

        if (latestGap?.suggestions?.length > 0) {
            items.push({
                type:        'gap_suggestion',
                label:       'Acción de desarrollo 360°',
                description: latestGap.suggestions[0],
                link:        '/employeefeedbackreport',
            });
        }

        /* 5. Stagnant or AT_RISK OKR (max 1) */
        const riskyOkr = await Okr.findOne({
            where: {
                responsible_employee_id: employeeId,
                status: { [Op.in]: [OKR.STATUS_STAGNANT, OKR.STATUS_AT_RISK] },
            },
            order: [['due_date', 'ASC']],
        });

        if (riskyOkr) {
            const statusLabel = riskyOkr.status === OKR.STATUS_STAGNANT ? 'estancado' : 'en riesgo';
            items.push({
                type:        'okr_risk',
                label:       `OKR ${statusLabel}: ${riskyOkr.title}`,
                description: `Tu objetivo está ${statusLabel}. Actualizá el progreso para reencaminarlo.`,
                link:        '/myobjectives',
            });
        }

        return res.json(items);
    } catch (err) {
        next(err);
    }
}

module.exports = { getNextSteps };
