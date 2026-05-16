require('dotenv').config({ path: '.env.dev' });

const {
    sequelize,
    Role,
    User,
    UserRole,
    Department,
    Employee,
    Course,
    CourseEnrollment,
    OnboardingTemplate,
    OnboardingTemplateTask,
    EmployeeOnboarding,
    EmployeeOnboardingTask,
} = require('../models');

async function seedDatabase() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connected');

        // OJO: esto borra y recrea todo
        await sequelize.sync({ force: true });
        console.log('✅ Database synced');

        // =========================
        // Roles
        // =========================
        const employeeRole = await Role.create({
            name: 'employee',
            description: 'Regular employee',
        });

        const leaderRole = await Role.create({
            name: 'leader',
            description: 'Team leader',
        });

        const hrRole = await Role.create({
            name: 'hr',
            description: 'Human resources',
        });

        console.log('✅ Roles created');

        // =========================
        // Departments
        // =========================
        const techDepartment = await Department.create({
            name: 'Tecnologia',
            description: 'Area de tecnologia',
            isActive: true,
        });

        const hrDepartment = await Department.create({
            name: 'Talentos',
            description: 'Area de recursos humanos',
            isActive: true,
        });

        const operationsDepartment = await Department.create({
            name: 'Operaciones',
            description: 'Area de operaciones',
            isActive: true,
        });

        console.log('✅ Departments created');

        // =========================
        // Users
        // =========================
        const hrUser = await User.create({
            email: 'talentos@empresa.com',
            passwordHash: 'hashed_password_1',
            isActive: true,
        });

        const leaderUser = await User.create({
            email: 'lider@empresa.com',
            passwordHash: 'hashed_password_2',
            isActive: true,
        });

        const employeeUser1 = await User.create({
            email: 'juan@empresa.com',
            passwordHash: 'hashed_password_3',
            isActive: true,
        });

        const employeeUser2 = await User.create({
            email: 'ana@empresa.com',
            passwordHash: 'hashed_password_4',
            isActive: true,
        });

        const employeeUser3 = await User.create({
            email: 'lucas@empresa.com',
            passwordHash: 'hashed_password_5',
            isActive: true,
        });

        console.log('✅ Users created');

        // =========================
        // UserRoles
        // =========================
        await UserRole.bulkCreate([
            {
                userId: hrUser.id,
                roleId: hrRole.id,
            },
            {
                userId: leaderUser.id,
                roleId: employeeRole.id,
            },
            {
                userId: leaderUser.id,
                roleId: leaderRole.id,
            },
            {
                userId: employeeUser1.id,
                roleId: employeeRole.id,
            },
            {
                userId: employeeUser2.id,
                roleId: employeeRole.id,
            },
            {
                userId: employeeUser3.id,
                roleId: employeeRole.id,
            },
        ]);

        console.log('✅ User roles created');

        // =========================
        // Employees
        // =========================
        const hrEmployee = await Employee.create({
            userId: hrUser.id,
            departmentId: hrDepartment.id,
            firstName: 'Carla',
            lastName: 'Gomez',
            documentType: 'DNI',
            documentNumber: '20111222',
            birthDate: '1990-04-15',
            hireDate: '2023-03-01',
            position: 'HR Specialist',
            status: 'ACTIVE',
            phone: '1122334455',
            address: 'Av. Siempre Viva 100',
            emergencyContactName: 'Laura Gomez',
            emergencyContactPhone: '1199887766',
        });

        const leaderEmployee = await Employee.create({
            userId: leaderUser.id,
            departmentId: techDepartment.id,
            firstName: 'Martin',
            lastName: 'Lopez',
            documentType: 'DNI',
            documentNumber: '22333444',
            birthDate: '1988-09-21',
            hireDate: '2022-01-10',
            position: 'Engineering Lead',
            status: 'ACTIVE',
            phone: '1133445566',
            address: 'Calle 123',
            emergencyContactName: 'Sofia Lopez',
            emergencyContactPhone: '1177665544',
        });

        const employee1 = await Employee.create({
            userId: employeeUser1.id,
            departmentId: techDepartment.id,
            managerId: leaderEmployee.id,
            firstName: 'Juan',
            lastName: 'Perez',
            documentType: 'DNI',
            documentNumber: '30123456',
            birthDate: '1995-08-10',
            hireDate: '2024-06-01',
            position: 'Backend Developer',
            status: 'ACTIVE',
            phone: '1144556677',
            address: 'Calle Falsa 123',
            emergencyContactName: 'Maria Perez',
            emergencyContactPhone: '1166778899',
        });

        const employee2 = await Employee.create({
            userId: employeeUser2.id,
            departmentId: techDepartment.id,
            managerId: leaderEmployee.id,
            firstName: 'Ana',
            lastName: 'Martinez',
            documentType: 'DNI',
            documentNumber: '30987654',
            birthDate: '1997-11-05',
            hireDate: '2024-07-15',
            position: 'Frontend Developer',
            status: 'ACTIVE',
            phone: '1155667788',
            address: 'Av. Central 456',
            emergencyContactName: 'Luis Martinez',
            emergencyContactPhone: '1144332211',
        });

        const employee3 = await Employee.create({
            userId: employeeUser3.id,
            departmentId: operationsDepartment.id,
            firstName: 'Lucas',
            lastName: 'Fernandez',
            documentType: 'DNI',
            documentNumber: '31888999',
            birthDate: '1993-02-19',
            hireDate: '2024-09-01',
            position: 'Operations Analyst',
            status: 'ONBOARDING',
            phone: '1166443322',
            address: 'Diagonal Norte 789',
            emergencyContactName: 'Claudia Fernandez',
            emergencyContactPhone: '1122446688',
        });

        console.log('✅ Employees created');

        // =========================
        // Courses
        // =========================
        const course1 = await Course.create({
            title: 'Node.js Fundamentals',
            description: 'Curso introductorio de Node.js',
            durationHours: 12,
            modality: 'ASYNC',
            provider: 'Internal Academy',
            url: 'https://example.com/nodejs-fundamentals',
            isActive: true,
        });

        const course2 = await Course.create({
            title: 'React for Teams',
            description: 'Curso de trabajo en equipo con React',
            durationHours: 10,
            modality: 'LIVE',
            provider: 'Internal Academy',
            url: 'https://example.com/react-for-teams',
            isActive: true,
        });

        const course3 = await Course.create({
            title: 'Effective Feedback',
            description: 'Curso para dar y recibir feedback efectivo',
            durationHours: 6,
            modality: 'HYBRID',
            provider: 'People Development',
            url: 'https://example.com/effective-feedback',
            isActive: true,
        });

        console.log('✅ Courses created');

        // =========================
        // CourseEnrollments
        // =========================
        await CourseEnrollment.bulkCreate([
            {
                employeeId: employee1.id,
                courseId: course1.id,
                status: 'IN_PROGRESS',
                progressPercent: 40,
            },
            {
                employeeId: employee1.id,
                courseId: course3.id,
                status: 'ENROLLED',
                progressPercent: 0,
            },
            {
                employeeId: employee2.id,
                courseId: course2.id,
                status: 'COMPLETED',
                progressPercent: 100,
                completedAt: new Date(),
            },
            {
                employeeId: leaderEmployee.id,
                courseId: course3.id,
                status: 'IN_PROGRESS',
                progressPercent: 75,
            },
        ]);

        console.log('✅ Course enrollments created');
        // =========================
        // Onboarding Templates
        // =========================
        const standardOnboardingTemplate = await OnboardingTemplate.create({
            name: 'Onboarding estándar',
            description: 'Plantilla general para nuevos ingresos',
            isActive: true,
        });

        console.log('✅ Onboarding template created');

        // =========================
        // Onboarding Template Tasks
        // =========================
        const onboardingTask1 = await OnboardingTemplateTask.create({
            templateId: standardOnboardingTemplate.id,
            title: 'Completar documentación de ingreso',
            description: 'Subir documentación personal y firmar formularios de ingreso',
            responsibleRole: 'employee',
            dueInDays: 1,
            sortOrder: 1,
        });

        const onboardingTask2 = await OnboardingTemplateTask.create({
            templateId: standardOnboardingTemplate.id,
            title: 'Reunión inicial con líder',
            description: 'Coordinar reunión de bienvenida y alineación de expectativas',
            responsibleRole: 'leader',
            dueInDays: 2,
            sortOrder: 2,
        });

        const onboardingTask3 = await OnboardingTemplateTask.create({
            templateId: standardOnboardingTemplate.id,
            title: 'Configuración de herramientas',
            description: 'Configurar correo, acceso al repositorio y herramientas internas',
            responsibleRole: 'employee',
            dueInDays: 3,
            sortOrder: 3,
        });

        const onboardingTask4 = await OnboardingTemplateTask.create({
            templateId: standardOnboardingTemplate.id,
            title: 'Capacitación inicial de cultura y procesos',
            description: 'Asistir a la capacitación introductoria sobre cultura y procesos internos',
            responsibleRole: 'hr',
            dueInDays: 5,
            sortOrder: 4,
        });

        console.log('✅ Onboarding template tasks created');

        // =========================
        // Employee Onboardings
        // =========================
        const lucasOnboarding = await EmployeeOnboarding.create({
            employeeId: employee3.id,
            templateId: standardOnboardingTemplate.id,
            startDate: '2024-09-01',
            status: 'IN_PROGRESS',
        });

        const anaOnboarding = await EmployeeOnboarding.create({
            employeeId: employee2.id,
            templateId: standardOnboardingTemplate.id,
            startDate: '2024-07-15',
            status: 'COMPLETED',
            completedAt: new Date(),
        });

        console.log('✅ Employee onboardings created');

        // =========================
        // Employee Onboarding Tasks
        // =========================
        await EmployeeOnboardingTask.bulkCreate([
            {
                employeeOnboardingId: lucasOnboarding.id,
                templateTaskId: onboardingTask1.id,
                title: onboardingTask1.title,
                description: onboardingTask1.description,
                assignedToEmployeeId: employee3.id,
                dueDate: '2024-09-02',
                status: 'COMPLETED',
                completedAt: new Date(),
            },
            {
                employeeOnboardingId: lucasOnboarding.id,
                templateTaskId: onboardingTask2.id,
                title: onboardingTask2.title,
                description: onboardingTask2.description,
                assignedToEmployeeId: leaderEmployee.id,
                dueDate: '2024-09-03',
                status: 'IN_PROGRESS',
            },
            {
                employeeOnboardingId: lucasOnboarding.id,
                templateTaskId: onboardingTask3.id,
                title: onboardingTask3.title,
                description: onboardingTask3.description,
                assignedToEmployeeId: employee3.id,
                dueDate: '2024-09-04',
                status: 'PENDING',
            },
            {
                employeeOnboardingId: lucasOnboarding.id,
                templateTaskId: onboardingTask4.id,
                title: onboardingTask4.title,
                description: onboardingTask4.description,
                assignedToEmployeeId: hrEmployee.id,
                dueDate: '2024-09-06',
                status: 'PENDING',
            },
            {
                employeeOnboardingId: anaOnboarding.id,
                templateTaskId: onboardingTask1.id,
                title: onboardingTask1.title,
                description: onboardingTask1.description,
                assignedToEmployeeId: employee2.id,
                dueDate: '2024-07-16',
                status: 'COMPLETED',
                completedAt: new Date(),
            },
            {
                employeeOnboardingId: anaOnboarding.id,
                templateTaskId: onboardingTask2.id,
                title: onboardingTask2.title,
                description: onboardingTask2.description,
                assignedToEmployeeId: leaderEmployee.id,
                dueDate: '2024-07-17',
                status: 'COMPLETED',
                completedAt: new Date(),
            },
            {
                employeeOnboardingId: anaOnboarding.id,
                templateTaskId: onboardingTask3.id,
                title: onboardingTask3.title,
                description: onboardingTask3.description,
                assignedToEmployeeId: employee2.id,
                dueDate: '2024-07-18',
                status: 'COMPLETED',
                completedAt: new Date(),
            },
            {
                employeeOnboardingId: anaOnboarding.id,
                templateTaskId: onboardingTask4.id,
                title: onboardingTask4.title,
                description: onboardingTask4.description,
                assignedToEmployeeId: hrEmployee.id,
                dueDate: '2024-07-20',
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        ]);

        console.log('✅ Employee onboarding tasks created');
        console.log('🎉 Seed completed successfully');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    }
}

seedDatabase();