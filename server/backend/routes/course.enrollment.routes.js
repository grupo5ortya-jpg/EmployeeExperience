const { Router } = require('express');
const {
    getAllCourseEnrollments,
    getCourseEnrollmentById,
    createCourseEnrollment,
    updateCourseEnrollment,
    deleteCourseEnrollment,
} = require('../controllers/course.enrollment.controllers');

const courseEnrollmentRouter = Router();

courseEnrollmentRouter.get('/', getAllCourseEnrollments);
courseEnrollmentRouter.get('/:id', getCourseEnrollmentById);
courseEnrollmentRouter.post('/', createCourseEnrollment);
courseEnrollmentRouter.patch('/:id', updateCourseEnrollment);
courseEnrollmentRouter.delete('/:id', deleteCourseEnrollment);

module.exports = courseEnrollmentRouter;