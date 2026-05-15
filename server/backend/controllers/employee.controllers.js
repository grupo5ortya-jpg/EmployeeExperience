const { Employee, User, Department, Course, CourseEnrollment } = require('../models');
const { formatEmployeeCoursesResponse } = require('../utils/utils.course.mappers')
const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.findAll({
            attributes: [
                'id',
                'firstName',
                'lastName',
                'fullName',
                'userId',
                'departmentId',
                'managerId',
                'documentType',
                'documentNumber',
                'birthDate',
                'hireDate',
                'position',
                'status',
                'phone',
                'address',
                'emergencyContactName',
                'emergencyContactPhone',
                'createdAt',
                'updatedAt',
            ],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'isActive', 'auth0Id'],
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Employee,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'position'],
                },
            ],
        });

        return res.status(200).json(employees);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employees',
            error: error.message,
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'email', 'isActive', 'auth0Id'],
                },
                {
                    model: Department,
                    as: 'department',
                    attributes: ['id', 'name', 'description'],
                },
                {
                    model: Employee,
                    as: 'manager',
                    attributes: ['id', 'firstName', 'lastName', 'position'],
                },
                {
                    model: Employee,
                    as: 'directReports',
                    attributes: ['id', 'firstName', 'lastName', 'position'],
                },
            ],
        });

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        return res.status(200).json(employee);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employee',
            error: error.message,
        });
    }
};

const createEmployee = async (req, res) => {
    try {
        const {
            userId,
            departmentId,
            managerId,
            firstName,
            lastName,
            documentType,
            documentNumber,
            birthDate,
            hireDate,
            position,
            status,
            phone,
            address,
            emergencyContactName,
            emergencyContactPhone,
        } = req.body;

        const newEmployee = await Employee.create({
            userId,
            departmentId,
            managerId,
            firstName,
            lastName,
            documentType,
            documentNumber,
            birthDate,
            hireDate,
            position,
            status,
            phone,
            address,
            emergencyContactName,
            emergencyContactPhone,
        });

        return res.status(201).json(newEmployee);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create employee',
            error: error.message,
        });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        await employee.update(req.body);

        return res.status(200).json(employee);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update employee',
            error: error.message,
        });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        await employee.destroy();

        return res.status(200).json({
            message: 'Employee deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete employee',
            error: error.message,
        });
    }
};
const getEmployeeCourses = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findByPk(id, {
            attributes: ['id', 'firstName', 'lastName', 'position', 'status'],
            include: [
                {
                    model: CourseEnrollment,
                    as: 'courseEnrollments',
                    attributes: ['id', 'status', 'progressPercent', 'enrolledAt', 'completedAt'],
                    include: [
                        {
                            model: Course,
                            as: 'course',
                            attributes: ['id', 'title', 'description', 'modality', 'provider', 'durationHours'],
                        },
                    ],
                },
            ],
        });

        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        // const formattedResponse = {
        //     employee: {
        //         id: employee.id,
        //         firstName: employee.firstName,
        //         lastName: employee.lastName,
        //         position: employee.position,
        //         status: employee.status,
        //     },
        //     courses: employee.courseEnrollments.map((enrollment) => ({
        //         id: enrollment.course.id,
        //         title: enrollment.course.title,
        //         description: enrollment.course.description,
        //         modality: enrollment.course.modality,
        //         provider: enrollment.course.provider,
        //         durationHours: enrollment.course.durationHours,
        //         enrollment: {
        //             id: enrollment.id,
        //             status: enrollment.status,
        //             progressPercent: enrollment.progressPercent,
        //             enrolledAt: enrollment.enrolledAt,
        //             completedAt: enrollment.completedAt,
        //         },
        //     })),
        // };

        return res.status(200).json(formatEmployeeCoursesResponse(employee));
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch employee courses',
            error: error.message,
        });
    }
};

module.exports = {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeCourses
};