const { Op } = require('sequelize');
const { Employee, Person, Department, SurveyAssignment } = require('./sequelize');

/**
 * Builds an array of mentor candidate data for a given new employee.
 * Excludes the new employee and inactive employees.
 * Enriches each candidate with department, position, seniority, and
 * the count of completed survey cycles (used as an engagement proxy).
 *
 * @param {string} newEmployeeId - UUID of the newly onboarded employee
 * @returns {Promise<Array>}
 */
async function buildMentorCandidates(newEmployeeId) {
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

    return employees.map((emp) => ({
        employeeId:       emp.id,
        name:             `${emp.person.first_name} ${emp.person.last_name}`,
        department:       emp.department?.name ?? null,
        position:         emp.position ?? null,
        hireDate:         emp.hire_date ?? null,
        completedSurveys: emp.surveyAssignments?.length ?? 0,
    }));
}

module.exports = { buildMentorCandidates };
