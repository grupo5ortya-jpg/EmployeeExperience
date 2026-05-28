const { Op } = require('sequelize');
const { Employee, Person, Department, SurveyAssignment } = require('./sequelize');

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

    const candidates = employees.map((emp) => ({
        employeeId:       emp.id,
        name:             `${emp.person.first_name} ${emp.person.last_name}`,
        department:       emp.department?.name ?? null,
        position:         emp.position ?? null,
        hireDate:         emp.hire_date ?? null,
        completedSurveys: emp.surveyAssignments?.length ?? 0,
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
