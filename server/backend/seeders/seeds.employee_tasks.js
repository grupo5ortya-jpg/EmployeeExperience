module.exports = async function (sequelize) {
	const { EmployeeTask, Employee, Task } = sequelize.models;

	const count = await EmployeeTask.count();
	if (count > 0) return;

	const employees = await Employee.findAll({ limit: 8 });
	const tasks     = await Task.findAll();

	if (employees.length === 0 || tasks.length === 0) {
		throw new Error('seeds.employee_tasks.js requiere employees y tasks ya creados.');
	}

	// Fecha base: hoy
	const today = new Date();
	const addDays = (d) => new Date(today.getTime() + d * 24 * 60 * 60 * 1000);

	const STATUSES = ['ENROLLED', 'IN_PROGRESS', 'SUBMITED', 'COMPLETED'];

	// Asignamos las primeras 6 tareas (onboarding) a los primeros 5 empleados
	// y 2 tareas adicionales a los empleados 6-8 (aprendizaje/admin)
	const assignments = [];
	const seen        = new Set(); // evitar duplicados de PK compuesta

	const push = (employeeIdx, taskIdx, status, dueDays) => {
		const emp  = employees[employeeIdx];
		const task = tasks[taskIdx];
		if (!emp || !task) return;
		const key = `${emp.id}-${task.id}`;
		if (seen.has(key)) return;
		seen.add(key);
		assignments.push({
			employee_id: emp.id,
			task_id:     task.id,
			status,
			due_date:    addDays(dueDays),
		});
	};

	// Empleados 0-4 → tareas de onboarding (índices 0-5)
	push(0, 0, 'COMPLETED',   -10);
	push(0, 1, 'COMPLETED',    -8);
	push(0, 2, 'IN_PROGRESS',   3);
	push(0, 3, 'ENROLLED',      7);

	push(1, 0, 'COMPLETED',   -5);
	push(1, 1, 'IN_PROGRESS',  2);
	push(1, 2, 'ENROLLED',     5);
	push(1, 4, 'ENROLLED',    10);

	push(2, 0, 'IN_PROGRESS',  1);
	push(2, 1, 'ENROLLED',     4);
	push(2, 3, 'ENROLLED',     6);
	push(2, 5, 'ENROLLED',     8);

	push(3, 0, 'SUBMITED',    -2);
	push(3, 2, 'IN_PROGRESS',  3);
	push(3, 4, 'ENROLLED',     7);

	push(4, 1, 'ENROLLED',     5);
	push(4, 3, 'ENROLLED',     9);
	push(4, 5, 'ENROLLED',    12);

	// Empleados 5-7 → tareas de aprendizaje y admin (índices 9-12)
	push(5, 9,  'IN_PROGRESS',  5);
	push(5, 11, 'ENROLLED',    14);
	push(6, 10, 'ENROLLED',     7);
	push(6, 12, 'ENROLLED',    20);
	push(7, 9,  'COMPLETED',   -3);
	push(7, 10, 'IN_PROGRESS',  4);

	await EmployeeTask.bulkCreate(assignments);
	console.log(`Seeded ${assignments.length} employee_tasks`);
};
