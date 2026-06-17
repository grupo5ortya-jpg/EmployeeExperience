
const { Op }                  = require('sequelize');
const { CareerPlan, Employee, Person, Department, JobOpening, JobOpeningSkill, Skill, EmployeeSkill } = require('../connection/sequelize');
const { generateCareerPlan }  = require('../connection/geminiService');

/* ── helpers ─────────────────────────────────────────────────── */

function levelName(levels, order) {
    return Array.isArray(levels)
        ? (levels.find((l) => l.order === order)?.name ?? `Nivel ${order}`)
        : `Nivel ${order}`;
}

function computeGap(jobOpeningSkills, employeeSkillMap) {
    const covered = [];
    const gaps    = [];
    const missing = [];

    for (const jos of jobOpeningSkills) {
        const { skill, required_level } = jos;
        const levels              = Array.isArray(skill.levels) ? skill.levels : [];
        const requiredLevelName   = levelName(levels, required_level);
        const es                  = employeeSkillMap.get(jos.skill_id);

        if (!es) {
            missing.push({ skillId: skill.id, skillName: skill.name, skillType: skill.type, requiredLevel: required_level, requiredLevelName });
        } else if (es.level < required_level) {
            gaps.push({ skillId: skill.id, skillName: skill.name, skillType: skill.type, currentLevel: es.level, currentLevelName: levelName(levels, es.level), requiredLevel: required_level, requiredLevelName });
        } else {
            covered.push({ skillId: skill.id, skillName: skill.name, skillType: skill.type, currentLevel: es.level, currentLevelName: levelName(levels, es.level), requiredLevel: required_level, requiredLevelName });
        }
    }

    return { covered, gaps, missing };
}

function formatPlan(cp, isActive = false) {
    return {
        id:             cp.id,
        employeeId:     cp.employee_id,
        jobOpeningId:   cp.job_opening_id,
        targetPosition: cp.targetPosition
            ? { id: cp.targetPosition.id, title: cp.targetPosition.title }
            : (cp.gap_snapshot?.targetPosition ?? null),
        gapSnapshot:    cp.gap_snapshot,
        plan:           cp.plan,
        generatedAt:    cp.generated_at,
        isActive,
        createdAt:      cp.createdAt,
    };
}

const JOB_OPENING_INCLUDE = {
    model:   JobOpening,
    as:      'targetPosition',
    include: [{ model: Department, as: 'department', attributes: ['name'] }],
};

/* ── self-check for Colaborador ──────────────────────────────── */
function assertSelfOrTalento(req, employeeId) {
    if (req.user.role !== 'Talento' && req.user.employeeId !== employeeId) {
        const err = new Error('Solo podés acceder a tu propio plan de carrera.');
        err.status = 403;
        throw err;
    }
}

/* ── POST /career-simulator ──────────────────────────────────── */
async function generatePlan(req, res, next) {
    try {
        const { employeeId, jobOpeningId } = req.body;
        if (!employeeId || !jobOpeningId) {
            return res.status(400).json({ error: 'employeeId y jobOpeningId son requeridos.' });
        }

        assertSelfOrTalento(req, employeeId);

        // Fetch employee with current skills
        const employee = await Employee.findByPk(employeeId, {
            include: [
                { model: Person,        as: 'person',        attributes: ['first_name', 'last_name'] },
                { model: EmployeeSkill, as: 'employeeSkills', include: [{ model: Skill, as: 'skill' }] },
            ],
        });
        if (!employee) return res.status(404).json({ error: 'Empleado no encontrado.' });

        // Fetch job opening with required skills
        const jobOpening = await JobOpening.findByPk(jobOpeningId, {
            include: [
                { model: Department,      as: 'department',      attributes: ['name'] },
                { model: JobOpeningSkill, as: 'jobOpeningSkills', include: [{ model: Skill, as: 'skill' }] },
            ],
        });
        if (!jobOpening) return res.status(404).json({ error: 'Puesto objetivo no encontrado.' });

        // Compute gap
        const employeeSkillMap = new Map(employee.employeeSkills.map((es) => [es.skill_id, es]));
        const { covered, gaps, missing } = computeGap(jobOpening.jobOpeningSkills, employeeSkillMap);

        const gapSnapshot = {
            targetPosition: {
                id:         jobOpening.id,
                title:      jobOpening.title,
                department: jobOpening.department?.name ?? null,
            },
            covered,
            gaps,
            missing,
        };

        // Call Gemini
        const employeeName = `${employee.person.first_name} ${employee.person.last_name}`;
        const plan = await generateCareerPlan({
            employeeName,
            currentPosition:  employee.position ?? null,
            targetPosition:   jobOpening.title,
            targetDepartment: jobOpening.department?.name ?? null,
            gapSnapshot,
        });

        // Persist
        const created = await CareerPlan.create({
            employee_id:    employeeId,
            job_opening_id: jobOpeningId,
            gap_snapshot:   gapSnapshot,
            plan,
            generated_at:   new Date(),
        });

        return res.status(201).json(formatPlan(
            { ...created.toJSON(), targetPosition: { id: jobOpening.id, title: jobOpening.title } },
            true,
        ));
    } catch (err) {
        next(err);
    }
}

/* ── GET /career-simulator/:employeeId ───────────────────────── */
async function getHistory(req, res, next) {
    try {
        const { employeeId } = req.params;
        assertSelfOrTalento(req, employeeId);

        const plans = await CareerPlan.findAll({
            where:   { employee_id: employeeId },
            include: [JOB_OPENING_INCLUDE],
            order:   [['generated_at', 'DESC']],
        });

        return res.json(plans.map((cp, idx) => formatPlan(cp, idx === 0)));
    } catch (err) {
        next(err);
    }
}

/* ── GET /career-simulator/:employeeId/active ────────────────── */
async function getActive(req, res, next) {
    try {
        const { employeeId } = req.params;
        assertSelfOrTalento(req, employeeId);

        const plan = await CareerPlan.findOne({
            where:   { employee_id: employeeId },
            include: [JOB_OPENING_INCLUDE],
            order:   [['generated_at', 'DESC']],
        });

        if (!plan) return res.status(404).json({ error: 'El empleado no tiene ningún plan de carrera generado.' });

        return res.json(formatPlan(plan, true));
    } catch (err) {
        next(err);
    }
}

module.exports = { generatePlan, getHistory, getActive };
