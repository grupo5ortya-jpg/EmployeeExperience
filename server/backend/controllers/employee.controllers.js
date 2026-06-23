const { Op } = require('sequelize');
const { sequelize, Employee, Person, Department, User, Role, Task, TaskType, EmployeeTask, Alert, Team, EmployeeAsset, Asset } = require('../connection/sequelize');
const { TASK_TYPE, PERSON } = require('../utils/constants/models.constants.js');

function isValidDocumentType(documentType) {
	return PERSON.DOCUMENT_TYPES.includes(documentType);
}

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

// Activos asignados — solo para el detalle (GET /employees/:id), no para el listado completo
// (evitaría un JOIN extra por cada fila de EmployeeList sin necesidad).
// separate:true es obligatorio acá: sin esto, este hasMany conviviendo con "leaders" (hasMany a
// través de Team) en el mismo nivel genera un producto cartesiano que Sequelize no separa bien al
// hidratar, truncando "assets" a 1 elemento aunque la fila real tenga varios (verificado con un
// empleado con 6 assets devolviendo solo 1 sin este flag).
const EMPLOYEE_DETAIL_INCLUDE = [
	...EMPLOYEE_INCLUDE,
	{
		model: EmployeeAsset,
		as: 'assets',
		separate: true,
		include: [{ model: Asset, as: 'asset', attributes: ['id', 'name', 'serial_number'] }],
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
		// undefined (no e.assets) → no aparece en el JSON; solo viene en el detalle (EMPLOYEE_DETAIL_INCLUDE).
		// Solo activos sin devolver — lo que HR debería recuperar si el empleado se va.
		assets: e.assets
			? e.assets
				.filter((ea) => !ea.return_date)
				.map((ea) => ({
					id: ea.asset_id,
					name: ea.asset?.name ?? null,
					serialNumber: ea.asset?.serial_number ?? null,
					assignmentDate: ea.assignment_date,
					note: ea.note ?? null,
				}))
			: undefined,
	};
}

const getAllEmployees = async (req, res, next) => {
	try {
		const where = {};

		// Líder solo ve su propio registro + sus reportes directos (Team)
		if (req.user.role === 'Líder') {
			const reports = await Team.findAll({
				where: { leader_id: req.user.employeeId },
				attributes: ['collaborator_id'],
			});
			where.id = { [Op.in]: [req.user.employeeId, ...reports.map((r) => r.collaborator_id)] };
		}

		// Filtros opcionales — evitan traer el directorio completo cuando el consumidor
		// solo necesita un departamento/status puntual (ej. participantes de Feedback 360°).
		if (req.query.departmentId) where.department_id = req.query.departmentId;
		if (req.query.status)       where.status         = req.query.status;

		const employees = await Employee.findAll({ where, include: EMPLOYEE_INCLUDE });
		res.json(employees.map(formatEmployee));
	} catch (err) {
		next(err);
	}
};

const getEmployeeById = async (req, res, next) => {
	try {
		const employee = await Employee.findByPk(req.params.id, { include: EMPLOYEE_DETAIL_INCLUDE });
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
		taskTypeId
	} = req.body;

	if (documentType !== undefined && !isValidDocumentType(documentType)) {
		return res.status(400).json({
			status: 'fail',
			message: `Tipo de documento inválido. Valores permitidos: ${PERSON.DOCUMENT_TYPES.join(', ')}.`,
		});
	}

	const t = await sequelize.transaction();

	try {

		// =========================================
		// PERSON
		// =========================================

		const person = await Person.create({
			first_name: firstName,
			last_name: lastName,
			document_type: documentType,
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

		// Si HR no elige un template explícito en "Template de plan", se usa el TaskType de
		// sistema "Onboarding estándar" (TASK_TYPE.SYSTEM_TASK_TYPES) como default — antes esto
		// buscaba por nombre 'Onboarding' (string que nunca matcheaba ningún TaskType real,
		// ver EXP-401-BUG), dejando a todo empleado nuevo sin ninguna tarea asignada.
		const resolvedTaskTypeId = taskTypeId
			|| (await TaskType.findOne({ where: { name: TASK_TYPE.SYSTEM_TASK_TYPES[0].name }, transaction: t }))?.id;

		const onboardingTasks = resolvedTaskTypeId
			? await Task.findAll({ where: { task_type_id: resolvedTaskTypeId }, transaction: t })
			: [];

		if (onboardingTasks.length > 0) {

			const employeeTasks = onboardingTasks.map((task) => {

				// fecha base = hireDate o hoy
				const baseDate = hireDate
					? new Date(hireDate)
					: new Date();

				// si no tiene duración -> 0
				const duration = task.estimated_duration ?? 0;

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

// Campos que Líder/Colaborador pueden editar de su propio perfil (resto read-only, ver DetailEmployee.jsx)
const SELF_EDIT_FIELDS = ['personalEmail', 'phone', 'address', 'emergencyContactName', 'emergencyContactPhone'];

const updateEmployee = async (req, res, next) => {
	try {
		const isSelf = req.user.employeeId === req.params.id;
		if (req.user.role !== 'Talento' && !isSelf) {
			return res.status(403).json({ status: 'fail', message: 'Acceso denegado.' });
		}

		const employee = await Employee.findByPk(req.params.id, {
			include: [{ model: Person, as: 'person' }],
		});
		if (!employee) return res.status(404).json({ status: 'fail', message: 'Employee not found' });

		const body = req.user.role === 'Talento'
			? req.body
			: Object.fromEntries(Object.entries(req.body).filter(([key]) => SELF_EDIT_FIELDS.includes(key)));

		const {
			firstName, lastName, email, personalEmail, documentType, documentNumber, birthDate,
			phone, address, emergencyContactName, emergencyContactPhone,
			position, status, departmentId, hireDate,
		} = body;

		if (documentType !== undefined && !isValidDocumentType(documentType)) {
			return res.status(400).json({
				status: 'fail',
				message: `Tipo de documento inválido. Valores permitidos: ${PERSON.DOCUMENT_TYPES.join(', ')}.`,
			});
		}

		const personUpdates = {};
		if (firstName !== undefined) personUpdates.first_name = firstName;
		if (lastName !== undefined) personUpdates.last_name = lastName;
		if (email !== undefined) personUpdates.email = email;
		if (personalEmail !== undefined) personUpdates.personal_email = personalEmail || null;
		if (documentType !== undefined) personUpdates.document_type = documentType;
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
		// Sin onDelete explícito en la mayoría de las FKs hacia Employee (tareas, evaluaciones,
		// alertas, offboarding, etc.), Sequelize infiere un default según `allowNull` del campo —
		// para FKs que son además parte de una PK compuesta (ej. SurveyAssignment.employee_id,
		// `allowNull:true` a nivel Sequelize pero NOT NULL real en Postgres por ser PK, mismo
		// gotcha ya documentado para `assigned_by`) ese default termina siendo `SET NULL`, que
		// Postgres no puede cumplir sobre una columna de PK — y en vez de una FK violation limpia,
		// tira un `SequelizeDatabaseError` crudo de "viola la restricción not-null". Se atrapan
		// ambas clases y se devuelve un 409 claro en vez de un 500 (mismo objetivo que el guard de
		// Skill, pero genérico porque acá son demasiadas tablas dependientes para enumerar una por una).
		if (err.name === 'SequelizeForeignKeyConstraintError' || err.name === 'SequelizeDatabaseError') {
			return res.status(409).json({
				status:  'fail',
				message: 'No se puede eliminar: el empleado tiene datos asociados (tareas, evaluaciones, alertas, offboarding, etc.).',
			});
		}
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

// Marca un activo asignado como devuelto (return_date) — cierra el loop de "Activos a devolver"
// en OffboardingDetailPage. Sin alta/baja de activos desde la API todavía (ver EXP-DEV-07).
const returnAsset = async (req, res, next) => {
	try {
		const { id, assetId } = req.params;

		const employeeAsset = await EmployeeAsset.findOne({
			where: { employee_id: id, asset_id: assetId, return_date: null },
		});
		if (!employeeAsset) {
			return res.status(404).json({ status: 'fail', message: 'No se encontró una asignación activa de ese activo para este empleado.' });
		}

		await employeeAsset.update({ return_date: new Date() });
		res.json({ id: assetId, returnDate: employeeAsset.return_date });
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
	returnAsset,
};
