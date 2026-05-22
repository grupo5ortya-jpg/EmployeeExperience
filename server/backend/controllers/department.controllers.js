const { Department, Employee, Person } = require('../connection/sequelize');

const EMPLOYEE_INCLUDE = [
	{
		model:      Employee,
		as:         'employees',
		attributes: ['id', 'position', 'status'],
		include: [
			{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] },
		],
	},
];

function formatDepartment(d, withEmployees = false) {
	return {
		id:        d.id,
		name:      d.name,
		createdAt: d.createdAt,
		updatedAt: d.updatedAt,
		...(withEmployees && {
			employees: (d.employees ?? []).map(e => ({
				id:        e.id,
				position:  e.position,
				status:    e.status,
				firstName: e.person?.first_name ?? null,
				lastName:  e.person?.last_name  ?? null,
			})),
		}),
	};
}

const getAllDepartments = async (req, res, next) => {
	try {
		const departments = await Department.findAll();
		res.json(departments.map(d => formatDepartment(d)));
	} catch (err) {
		next(err);
	}
};

const getDepartmentById = async (req, res, next) => {
	try {
		const department = await Department.findByPk(req.params.id, {
			include: EMPLOYEE_INCLUDE,
		});
		if (!department) return res.status(404).json({ status: 'fail', message: 'Department not found' });
		res.json(formatDepartment(department, true));
	} catch (err) {
		next(err);
	}
};

const createDepartment = async (req, res, next) => {
	try {
		const { name } = req.body;
		const department = await Department.create({ name });
		res.status(201).json(formatDepartment(department));
	} catch (err) {
		next(err);
	}
};

const updateDepartment = async (req, res, next) => {
	try {
		const department = await Department.findByPk(req.params.id);
		if (!department) return res.status(404).json({ status: 'fail', message: 'Department not found' });

		const { name } = req.body;
		if (name !== undefined) await department.update({ name });

		res.json(formatDepartment(department));
	} catch (err) {
		next(err);
	}
};

// paranoid: true → destroy() sets deletedAt instead of hard-deleting
const deleteDepartment = async (req, res, next) => {
	try {
		const department = await Department.findByPk(req.params.id);
		if (!department) return res.status(404).json({ status: 'fail', message: 'Department not found' });
		await department.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllDepartments,
	getDepartmentById,
	createDepartment,
	updateDepartment,
	deleteDepartment,
};
