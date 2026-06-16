const { Op } = require('sequelize');
const { Employee, Person, Department, SurveyAssignment, FeedbackAssignment } = require('./sequelize');

/**
 * Builds an array of mentor candidate data for a given new employee.
 * Excludes the new employee and inactive employees.
 * Same-department candidates are listed first; within each group,
 * sorted by completed survey count descending (engagement proxy).
 *
 * @param {string}      newEmployeeId         - UUID of the newly onboarded employee
 * @param {string|null} newEmployeeDepartment - Department name used for prioritization
 * @returns {Promise<Array>}
 */
async function buildMentorCandidates(newEmployeeId, newEmployeeDepartment = null) {
    const employees = await Employee.findAll({
        where: {
            id:     { [Op.ne]: newEmployeeId },
            status: 'ACTIVE',
        },
        include: [
            {
                model:      Person,
                as:         'person',
                attributes: ['first_name', 'last_name'],
            },
            {
                model:      Department,
                as:         'department',
                attributes: ['name'],
            },
            {
                model:    SurveyAssignment,
                as:       'surveyAssignments',
                where:    { status: 'COMPLETED' },
                required: false,
                attributes: ['status'],
            },
        ],
    });

    // Average score received in completed 360° feedback (excludes self-assessments)
    const feedbackAssignments = await FeedbackAssignment.findAll({
        where: {
            evaluated_id: { [Op.in]: employees.map((emp) => emp.id) },
            status:       'COMPLETED',
            type:         { [Op.ne]: 'SELF' },
        },
        attributes: ['evaluated_id', 'scores'],
    });

    const feedbackScoresByEmployee = {};
    for (const fa of feedbackAssignments) {
        const scores = Object.values(fa.scores ?? {}).map(Number).filter((n) => !isNaN(n));
        if (scores.length === 0) continue;
        (feedbackScoresByEmployee[fa.evaluated_id] = feedbackScoresByEmployee[fa.evaluated_id] ?? []).push(...scores);
    }

    const avgFeedbackScore = (employeeId) => {
        const scores = feedbackScoresByEmployee[employeeId];
        if (!scores?.length) return null;
        return parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    };

    const candidates = employees.map((emp) => ({
        employeeId:       emp.id,
        name:             `${emp.person.first_name} ${emp.person.last_name}`,
        department:       emp.department?.name ?? null,
        position:         emp.position ?? null,
        hireDate:         emp.hire_date ?? null,
        completedSurveys: emp.surveyAssignments?.length ?? 0,
        feedbackAverage:  avgFeedbackScore(emp.id),
    }));

    // Same-department candidates first, then by engagement (completed surveys desc)
    candidates.sort((a, b) => {
        const aSameDept = a.department === newEmployeeDepartment ? 0 : 1;
        const bSameDept = b.department === newEmployeeDepartment ? 0 : 1;
        if (aSameDept !== bSameDept) return aSameDept - bSameDept;
        return b.completedSurveys - a.completedSurveys;
    });

    return candidates;
}

module.exports = { buildMentorCandidates };
