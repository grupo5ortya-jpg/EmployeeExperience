const { sequelize, Employee, Person, Department, User, Role, Task, TaskType, EmployeeTask, Alert, Team } = require('../connection/sequelize');

const DOC_TYPE_MAP = Person.rawAttributes.document_type.values;

const EMPLOYEE_INCLUDE = [
	{ model: Person, as: 'person' },
	{ model: Department, as: 'department', attributes: ['id', 'name'] },
	{
		model: User,
		as: 'user',
		attributes: ['id', 'email'],
		include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
	},
	{
		model: Employee,
		as: 'leaders',
		through: { attributes: [] },
		include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
	{
		model: Employee,
		as: 'mentor',
		attributes: ['id', 'position'],
		include: [{ model: Person, as: 'person', attributes: ['first_name', 'last_name'] }],
	},
];

function formatEmployee(e) {
	const leader = e.leaders?.[0] ?? null;
	return {
		id: e.id,
		firstName: e.person?.first_name ?? null,
		lastName: e.person?.last_name ?? null,
		documentType: e.person?.document_type ?? null,
		documentNumber: e.person?.document_number ?? null,
		birthDate: e.person?.birth_date ?? null,
		email: e.user?.email ?? null,
		personalEmail: e.person?.personal_email ?? null,
		phone: e.person?.phone ?? null,
		address: e.person?.address ?? null,
		emergencyContactName: e.person?.emergency_contact_name ?? null,
		emergencyContactPhone: e.person?.emergency_contact_phone ?? null,
		position: e.position,
		status: e.status,
		hireDate: e.hire_date ?? null,
		department: e.department ?? null,
		user: e.user ?? null,
		role: e.user?.role ?? null,
		manager: leader
			? {
				id: leader.id,
				firstName: leader.person?.first_name ?? null,
				lastName: leader.person?.last_name ?? null,
			}
			: null,
		mentor: e.mentor
			? {
				id: e.mentor.id,
				firstName: e.mentor.person?.first_name ?? null,
				lastName: e.mentor.person?.last_name ?? null,
				position: e.mentor.position ?? null,
			}
			: null,
	};
}

const getAllEmployees = async (req, res, next) => {
	try {
		const employees = await Employee.findAll({ include: EMPLOYEE_INCLUDE });
		res.json(employees.map(formatEmployee));
	} catch (err) {
		next(err);
	}
};

const getEmployeeById = async (req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id, { include: EMPLOYEE_INCLUDE });
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });
		res.json(formatEmployee(employee));
	} catch (err) {
		next(err);
	}
};

const createEmployee = async (req, res, next) => {
	const {
		firstName,
		lastName,
		documentType,
		documentNumber,
		birthDate,
		phone,
		address,
		emergencyContactName,
		emergencyContactPhone,
		position,
		status,
		departmentId,
		hireDate,
		managerId,
		email,
		personalEmail,
		roleId,
		taskType
	} = req.body;

	const t = await sequelize.transaction();

	try {

		// =========================================
		// PERSON
		// =========================================

		const person = await Person.create({
			first_name: firstName,
			last_name: lastName,
			document_type: DOC_TYPE_MAP[documentType] ?? documentType,
			document_number: documentNumber,
			birth_date: birthDate || null,
			phone: phone || null,
			address: address || null,
			emergency_contact_name: emergencyContactName || null,
			emergency_contact_phone: emergencyContactPhone || null,
			personal_email: personalEmail || null,
		}, { transaction: t });

		// =========================================
		// EMPLOYEE
		// =========================================

		const employee = await Employee.create({
			person_id: person.id,
			department_id: departmentId || null,
			position: position || null,
			status: status || 'ACTIVE',
			hire_date: hireDate || null,
		}, { transaction: t });

		// =========================================
		// MANAGER
		// =========================================

		if (managerId) {
			await employee.addLeader(managerId, {
				transaction: t,
			});
		}

		// =========================================
		// USER
		// =========================================

		if (email && roleId) {
			await User.create({
				email,
				role_id: roleId,
				employee_id: employee.id,
			}, { transaction: t });
		}

		// =========================================
		// AUTO ASSIGN ONBOARDING TASKS
		// =========================================

		const onboardingTasks = await Task.findAll({
			include: [
				{
					model: TaskType,
					as: 'taskType',
					where: {
						name: taskType || 'Onboarding',
					},
				},
			],
			transaction: t,
		});

		if (onboardingTasks.length > 0) {

			const employeeTasks = onboardingTasks.map((task) => {

				// fecha base = hireDate o hoy
				const baseDate = hireDate
					? new Date(hireDate)
					: new Date();

				// si no tiene duración -> 0
				const duration = task.estimatedDuration ?? 0;

				// sumar días
				baseDate.setDate(
					baseDate.getDate() + duration
				);

				return {
					employee_id: employee.id,
					task_id: task.id,
					status: 'ENROLLED',
					due_date: baseDate,
				};
			});

			await EmployeeTask.bulkCreate(employeeTasks, {
				transaction: t,
			});
		}

		// =========================================
		// COMMIT
		// =========================================

		await t.commit();

		// Alert the employee that their onboarding tasks are ready
		if (onboardingTasks.length > 0) {
			Alert.create({
				employee_id: employee.id,
				type:        'ONBOARDING_TASKS_ASSIGNED',
				message:     `Se te asignaron ${onboardingTasks.length} tareas de onboarding. ¡Comenzá tu incorporación!`,
				status:      'UNREAD',
			}).catch(console.error);
		}

		const full = await Employee.findByPk(employee.id, {
			include: EMPLOYEE_INCLUDE,
		});

		res.status(201).json(formatEmployee(full));

	} catch (err) {

		await t.rollback();
		next(err);
	}
};

const updateEmployee = async (req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id, {
			include: [{ model: Person, as: 'person' }],
		});
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });

		const {
			firstName, lastName, email, personalEmail, documentType, documentNumber, birthDate,
			phone, address, emergencyContactName, emergencyContactPhone,
			position, status, departmentId, hireDate,
		} = req.body;

		const personUpdates = {};
		if (firstName !== undefined) personUpdates.first_name = firstName;
		if (lastName !== undefined) personUpdates.last_name = lastName;
		if (email !== undefined) personUpdates.email = email;
		if (personalEmail !== undefined) personUpdates.personal_email = personalEmail || null;
		if (documentType !== undefined) personUpdates.document_type = DOC_TYPE_MAP[documentType] ?? documentType;
		if (documentNumber !== undefined) personUpdates.document_number = documentNumber;
		if (birthDate !== undefined) personUpdates.birth_date = birthDate || null;
		if (phone !== undefined) personUpdates.phone = phone || null;
		if (address !== undefined) personUpdates.address = address || null;
		if (emergencyContactName !== undefined) personUpdates.emergency_contact_name = emergencyContactName || null;
		if (emergencyContactPhone !== undefined) personUpdates.emergency_contact_phone = emergencyContactPhone || null;

		if (Object.keys(personUpdates).length) await employee.person.update(personUpdates);

		const employeeUpdates = {};
		if (position !== undefined) employeeUpdates.position = position;
		if (status !== undefined) employeeUpdates.status = status;
		if (departmentId !== undefined) employeeUpdates.department_id = departmentId || null;
		if (hireDate !== undefined) employeeUpdates.hire_date = hireDate || null;

		if (Object.keys(employeeUpdates).length) await employee.update(employeeUpdates);

		const updated = await Employee.findByPk(employee.id, { include: EMPLOYEE_INCLUDE });
		res.json(formatEmployee(updated));
	} catch (err) {
		next(err);
	}
};

const deleteEmployee = async (req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id);
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });
		await employee.destroy();
		res.status(204).end();
	} catch (err) {
		next(err);
	}
};

const assignMentor = async (req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id);
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });

		const { mentorId } = req.body;

		if (mentorId && mentorId === req.params.id) {
			return res.status(400).json({ status: 'fail', message: 'Un empleado no puede ser su propio mentor.' });
		}

		await employee.update({ mentor_id: mentorId ?? null });

		const updated = await Employee.findByPk(employee.id, { include: EMPLOYEE_INCLUDE });
		res.json(formatEmployee(updated));
	} catch (err) {
		next(err);
	}
};

const assignLeader = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { leaderId } = req.body;

		const employee = await Employee.findByPk(id);
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });

		if (leaderId && leaderId === id) {
			return res.status(400).json({ status: 'fail', message: 'Un empleado no puede ser su propio líder.' });
		}

		// Hard-delete (force:true) para evitar conflicto de PK con paranoid soft-delete
		await Team.destroy({ where: { collaborator_id: id }, force: true });

		if (leaderId) {
			await Team.create({ leader_id: leaderId, collaborator_id: id });
		}

		const updated = await Employee.findByPk(id, { include: EMPLOYEE_INCLUDE });
		res.json(formatEmployee(updated));
	} catch (err) {
		next(err);
	}
};

module.exports = {
	getAllEmployees,
	getEmployeeById,
	createEmployee,
	updateEmployee,
	deleteEmployee,
	assignMentor,
	assignLeader,
};
