const { CourseEnrollment, Employee, Course } = require('../models');

const getAllCourseEnrollments = async (req, res) => {
    try {
        const enrollments = await CourseEnrollment.findAll({
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'position'],
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'modality', 'provider'],
                },
            ],
        });

        return res.status(200).json(enrollments);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch course enrollments',
            error: error.message,
        });
    }
};

const getCourseEnrollmentById = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await CourseEnrollment.findByPk(id, {
            include: [
                {
                    model: Employee,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'position'],
                },
                {
                    model: Course,
                    as: 'course',
                    attributes: ['id', 'title', 'description', 'modality', 'provider'],
                },
            ],
        });

        if (!enrollment) {
            return res.status(404).json({
                message: 'Course enrollment not found',
            });
        }

        return res.status(200).json(enrollment);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to fetch course enrollment',
            error: error.message,
        });
    }
};

const createCourseEnrollment = async (req, res) => {
    try {
        const {
            employeeId,
            courseId,
            status,
            progressPercent,
            enrolledAt,
            completedAt,
        } = req.body;

        const employee = await Employee.findByPk(employeeId);
        if (!employee) {
            return res.status(404).json({
                message: 'Employee not found',
            });
        }

        const course = await Course.findByPk(courseId);
        if (!course) {
            return res.status(404).json({
                message: 'Course not found',
            });
        }

        const existingEnrollment = await CourseEnrollment.findOne({
            where: { employeeId, courseId },
        });

        if (existingEnrollment) {
            return res.status(409).json({
                message: 'Employee is already enrolled in this course',
            });
        }

        const newEnrollment = await CourseEnrollment.create({
            employeeId,
            courseId,
            status,
            progressPercent,
            enrolledAt,
            completedAt,
        });

        return res.status(201).json(newEnrollment);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to create course enrollment',
            error: error.message,
        });
    }
};

const updateCourseEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await CourseEnrollment.findByPk(id);

        if (!enrollment) {
            return res.status(404).json({
                message: 'Course enrollment not found',
            });
        }

        await enrollment.update(req.body);

        return res.status(200).json(enrollment);
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update course enrollment',
            error: error.message,
        });
    }
};

const deleteCourseEnrollment = async (req, res) => {
    try {
        const { id } = req.params;

        const enrollment = await CourseEnrollment.findByPk(id);

        if (!enrollment) {
            return res.status(404).json({
                message: 'Course enrollment not found',
            });
        }

        await enrollment.destroy();

        return res.status(200).json({
            message: 'Course enrollment deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Failed to delete course enrollment',
            error: error.message,
        });
    }
};

module.exports = {
    getAllCourseEnrollments,
    getCourseEnrollmentById,
    createCourseEnrollment,
    updateCourseEnrollment,
    deleteCourseEnrollment,
};