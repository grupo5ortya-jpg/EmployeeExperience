const { Employee, Person, Department } = require('../connection/sequelize');
const { buildMentorCandidates }        = require('../connection/mentorService');
const { suggestMentors }               = require('../connection/geminiService');

async function getMentorSuggestions(req, res, next) {
    try {
        const { employeeId } = req.body;

        if (!employeeId) {
            return res.status(400).json({ error: "El campo 'employeeId' es requerido." });
        }

        // Fetch the new employee's basic info
        const newEmp = await Employee.findByPk(employeeId, {
            include: [
                { model: Person,     as: 'person',     attributes: ['first_name', 'last_name'] },
                { model: Department, as: 'department', attributes: ['name'] },
            ],
        });

        if (!newEmp) {
            return res.status(404).json({ error: 'Empleado no encontrado.' });
        }

        const newEmployee = {
            name:       `${newEmp.person.first_name} ${newEmp.person.last_name}`,
            department: newEmp.department?.name ?? null,
            position:   newEmp.position ?? null,
        };

        // Build mentor candidates from DB, same-department first
        const candidates = await buildMentorCandidates(employeeId, newEmployee.department);

        if (candidates.length === 0) {
            return res.json({ suggestions: [], message: 'No hay candidatos disponibles.' });
        }

        // suggestMentors already parses the JSON internally
        const suggestions = await suggestMentors(newEmployee, candidates);

        return res.json({ suggestions });
    } catch (error) {
        next(error);
    }
}

module.exports = { getMentorSuggestions };
