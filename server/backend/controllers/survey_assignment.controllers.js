const { SurveyAssignment, Survey, Employee, Person } = require('../connection/sequelize');
const { handleCompletePulseSurvey } = require('../connection/pulseSurveyService');

const ASSIGNMENT_INCLUDE = [
	{ model: Survey,   as: 'survey',   attributes: ['id', 'name'] },
	{
		model:      Employee,
		as:         'employee',
		attributes: ['id', 'position'],
		include:    [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
];

function formatAssignment(a) {
	return {
		surveyId:    a.survey_id,
		employeeId:  a.employee_id,
		assignedBy:  a.assigned_by  ?? null,
		dueDate:     a.due_date     ?? null,
		status:      a.status,
		survey:      a.survey       ?? null,
		employee: a.employee
			? {
				id:        a.employee.id,
				position:  a.employee.position,
				firstName: a.employee.person?.first_name ?? null,
				lastName:  a.employee.person?.last_name  ?? null,
			}
			: null,
	};
}

const getAllAssignments = async (req, res, next) => {
	try {
		const assignments = await SurveyAssignment.findAll({ include: ASSIGNMENT_INCLUDE });
		res.json(assignments.map(formatAssignment));
	} catch (err) {
		next(err);
	}
};

const getAssignmentById = async (req, res, next) => {
	try {
		const { surveyId, employeeId, assignedBy } = req.params;
		const assignment = await SurveyAssignment.findOne({
			where:   { survey_id: surveyId, employee_id: employeeId, assigned_by: assignedBy },
			include: ASSIGNMENT_INCLUDE,
		});
		if (!assignment) return res.status(404).json({ status: 'fail', message: 'Survey assignment not found' });
		res.json(formatAssignment(assignment));
	} catch (err) {
		next(err);
	}
};

const createAssignment = async (req, res, next) => {
	try {
		const { surveyId, employeeId, assignedBy, dueDate, status } = req.body;
		const assignment = await SurveyAssignment.create({
			survey_id:   surveyId,
			employee_id: employeeId,
			assigned_by: assignedBy || null,
			due_date:    dueDate    || null,
			status:      status     || 'PENDING',
		});
		const full = await SurveyAssignment.findOne({
			where:   { survey_id: assignment.survey_id, employee_id: assignment.employee_id, assigned_by: assignment.assigned_by },
			include: ASSIGNMENT_INCLUDE,
		});
		res.status(201).json(formatAssignment(full));
	} catch (err) {
		next(err);
	}
};

const updateAssignment = async (req, res, next) => {
	try {
		const { surveyId, employeeId, assignedBy } = req.params;
		const assignment = await SurveyAssignment.findOne({
			where: { survey_id: surveyId, employee_id: employeeId, assigned_by: assignedBy },
		});
		if (!assignment) return res.status(404).json({ status: 'fail', message: 'Survey assignment not found' });

		const { dueDate, status } = req.body;
		const updates = {};
		if (dueDate !== undefined) updates.due_date = dueDate || null;
		if (status  !== undefined) updates.status   = status;

		await assignment.update(updates);

		// Fire-and-forget: full AI analysis once all responses are in
		if (status === 'COMPLETED') {
			handleCompletePulseSurvey(surveyId, employeeId).catch(console.error);
		}

		const updated = await SurveyAssignment.findOne({
			where:   { survey_id: surveyId, employee_id: employeeId, assigned_by: assignedBy },
			include: ASSIGNMENT_INCLUDE,
		});
		res.json(formatAssignment(updated));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → soft delete
const deleteAssignment = async (req, res, next) => {
	try {
		const { surveyId, employeeId, assignedBy } = req.params;
		const assignment = await SurveyAssignment.findOne({
			where: { survey_id: surveyId, employee_id: employeeId, assigned_by: assignedBy },
		});
		if (!assignment) return res.status(404).json({ status: 'fail', message: 'Survey assignment not found' });
		await assignment.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllAssignments,
	getAssignmentById,
	createAssignment,
	updateAssignment,
	deleteAssignment,
};
