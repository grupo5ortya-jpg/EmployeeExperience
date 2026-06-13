const { Op } = require('sequelize');
const {
	Employee, Person, User, Role,
	AlumniProfile, EmployeeSkill, Skill,
} = require('../connection/sequelize');
const { ROLE } = require('../utils/constants/models.constants.js');

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

module.exports = { getAllAlumni, getAlumniByEmployee, updateAlumni };
