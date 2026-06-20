const { Op } = require('sequelize');
const {
	Employee, Person, User, Role,
	AlumniProfile, EmployeeSkill, Skill, Alert, EmployeeTask,
} = require('../connection/sequelize');
const { ROLE, EMPLOYEE_TASK } = require('../utils/constants/models.constants.js');

const ALUMNI_INCLUDE = (personWhere) => [
	{ model: Person, as: 'person', required: true, where: personWhere, attributes: ['first_name', 'last_name', 'document_number'] },
	{ model: AlumniProfile, as: 'alumniProfile' },
	{
		model:   EmployeeSkill,
		as:      'employeeSkills',
		include: [{ model: Skill, as: 'skill', attributes: ['id', 'name', 'type', 'levels'] }],
	},
	{
		model:      User,
		as:         'user',
		required:   true,
		attributes: ['id', 'email'],
		include:    [{ model: Role, as: 'role', required: true, where: { name: ROLE.ALUMNI }, attributes: ['id', 'name'] }],
	},
];

function formatAlumni(e) {
	return {
		id:        e.id,
		firstName: e.person?.first_name ?? null,
		lastName:  e.person?.last_name  ?? null,
		email:     e.user?.email        ?? null,
		hireDate:  e.hire_date          ?? null,
		rehirable: e.alumniProfile?.rehirable ?? true,
		tags:      e.alumniProfile?.tags      ?? [],
		skills: (e.employeeSkills ?? []).map((es) => ({
			skillId: es.skill_id,
			name:    es.skill?.name ?? null,
			type:    es.skill?.type ?? null,
			level:   es.level,
			levels:  es.skill?.levels ?? [],
		})),
	};
}

// GET /alumni?search=&skillId=&rehirable=true|false
const getAllAlumni = async (req, res, next) => {
	try {
		const { search, skillId, rehirable } = req.query;

		const where = {};
		const personWhere = search
			? {
				[Op.or]: [
					{ first_name: { [Op.iLike]: `%${search}%` } },
					{ last_name:  { [Op.iLike]: `%${search}%` } },
				],
			}
			: undefined;

		if (skillId) {
			const employeeSkills = await EmployeeSkill.findAll({ where: { skill_id: skillId }, attributes: ['employee_id'] });
			const employeeIds = employeeSkills.map((es) => es.employee_id);
			if (employeeIds.length === 0) return res.json([]);
			where.id = { [Op.in]: employeeIds };
		}

		const alumni = await Employee.findAll({ where, include: ALUMNI_INCLUDE(personWhere) });

		let result = alumni.map(formatAlumni);
		if (rehirable !== undefined) {
			const wanted = rehirable === 'true';
			result = result.filter((a) => a.rehirable === wanted);
		}

		res.json(result);
	} catch (err) {
		next(err);
	}
};

// GET /alumni/:employeeId
const getAlumniByEmployee = async (req, res, next) => {
	try {
		const employee = await Employee.findOne({
			where:   { id: req.params.employeeId },
			include: ALUMNI_INCLUDE(undefined),
		});
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Alumni not found' });

		res.json(formatAlumni(employee));
	} catch (err) {
		next(err);
	}
};

// PATCH /alumni/:employeeId {rehirable?, tags?}
const updateAlumni = async (req, res, next) => {
	try {
		const { employeeId } = req.params;
		const { rehirable, tags } = req.body;

		const profile = await AlumniProfile.findOne({ where: { employee_id: employeeId } });
		if (!profile) return res.status(404).json({ status: 'fail', message: 'Alumni profile not found' });

		const updates = {};
		if (rehirable !== undefined) updates.rehirable = rehirable;
		if (tags !== undefined) updates.tags = tags;
		await profile.update(updates);

		const employee = await Employee.findOne({ where: { id: employeeId }, include: ALUMNI_INCLUDE(undefined) });
		res.json(formatAlumni(employee));
	} catch (err) {
		next(err);
	}
};

// PATCH /alumni/:employeeId/rehire — vuelve a convertir al alumni en empleado activo (rol Colaborador)
const rehireAlumni = async (req, res, next) => {
	try {
		const { employeeId } = req.params;

		const user = await User.findOne({ where: { employee_id: employeeId } });
		if (!user) return res.status(404).json({ status: 'fail', message: 'User not found' });

		const colaboradorRole = await Role.findOne({ where: { name: ROLE.COLABORADOR } });
		if (!colaboradorRole) return res.status(404).json({ status: 'fail', message: 'Role not found' });

		const employeeBefore = await Employee.findByPk(employeeId, {
			include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
		});
		const name = employeeBefore?.person
			? `${employeeBefore.person.first_name ?? ''} ${employeeBefore.person.last_name ?? ''}`.trim()
			: 'El alumni';

		// Dispara el hook syncEmployeeStatus de User: Employee.status -> ACTIVE
		await user.update({ role_id: colaboradorRole.id });

		// Tareas que quedaron pendientes del paso por offboarding (el checklist nunca
		// completado, o tareas de otros templates marcadas vencidas a propósito al irse)
		// ya no aplican — se archivan (DROPPED) automáticamente. MyTasks.jsx ya agrupa los
		// templates 100% DROPPED en "Archivados" (colapsado, sin acción), sin que el
		// colaborador tenga que archivar nada a mano.
		await EmployeeTask.update(
			{ status: EMPLOYEE_TASK.STATUS_DROPPED },
			{
				where: {
					employee_id: employeeId,
					status: {
						[Op.in]: [
							EMPLOYEE_TASK.STATUS_ENROLLED,
							EMPLOYEE_TASK.STATUS_IN_PROGRESS,
							EMPLOYEE_TASK.STATUS_SUBMITTED,
						],
					},
				},
			},
		);

		await Alert.create({
			employee_id: employeeId,
			type: 'EMPLOYEE_REHIRED',
			message: `${name} fue recontratado!`,
			status: 'UNREAD',
		});

		await Alert.create({
			employee_id: employeeId,
			type: 'REHIRE_WELCOME',
			message: `¡Bienvenido de nuevo a la empresa, ${name}!`,
			status: 'UNREAD',
		});

		const employee = await Employee.findByPk(employeeId);
		res.json({ id: employee.id, status: employee.status });
	} catch (err) {
		next(err);
	}
};

module.exports = { getAllAlumni, getAlumniByEmployee, updateAlumni, rehireAlumni };
