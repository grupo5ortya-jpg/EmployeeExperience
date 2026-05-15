const { Course, Employee, CourseEnrollment } = require('../models');

const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll();

        return res.status(200).json(courses);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch courses',
            error: error.message,
        });
    }
};

const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id, {
            include: [
                {
                    model: CourseEnrollment,
                    as: 'courseEnrollments',
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName', 'position'],
                        },
                    ],
                },
            ],
        });

        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch course',
            error: error.message,
        });
    }
};

const createCourse = async (req, res) => {
    try {
        const {
            title,
            description,
            durationHours,
            modality,
            provider,
            url,
            isActive,
        } = req.body;

        const newCourse = await Course.create({
            title,
            description,
            durationHours,
            modality,
            provider,
            url,
            isActive,
        });

        return res.status(201).json(newCourse);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create course',
            error: error.message,
        });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        await course.update(req.body);

        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update course',
            error: error.message,
        });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);

        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        await course.destroy();

        return res.status(200).json({
            message: 'Course deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete course',
            error: error.message,
        });
    }
};
const getCourseEmployees = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id, {
            attributes: ['id', 'title', 'description', 'modality', 'provider', 'durationHours', 'isActive'],
            include: [
                {
                    model: CourseEnrollment,
                    as: 'courseEnrollments',
                    attributes: ['id', 'status', 'progressPercent', 'enrolledAt', 'completedAt'],
                    include: [
                        {
                            model: Employee,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName', 'position', 'status'],
                        },
                    ],
                },
            ],
        });

        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        const formattedResponse = {
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                modality: course.modality,
                provider: course.provider,
                durationHours: course.durationHours,
                isActive: course.isActive,
            },
            employees: course.courseEnrollments.map((enrollment) => ({
                id: enrollment.employee.id,
                firstName: enrollment.employee.firstName,
                lastName: enrollment.employee.lastName,
                position: enrollment.employee.position,
                status: enrollment.employee.status,
                enrollment: {
                    id: enrollment.id,
                    status: enrollment.status,
                    progressPercent: enrollment.progressPercent,
                    enrolledAt: enrollment.enrolledAt,
                    completedAt: enrollment.completedAt,
                },
            })),
        };

        return res.status(200).json(formattedResponse);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch course employees',
            error: error.message,
        });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseEmployees
};