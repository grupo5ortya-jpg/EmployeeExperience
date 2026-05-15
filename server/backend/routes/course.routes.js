const { Router } = require('express');
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getCourseEmployees
} = require('../controllers/course.controllers');

const courseRouter = Router();

courseRouter.get('/', getAllCourses);
courseRouter.get('/:id/employees', getCourseEmployees);
courseRouter.get('/:id', getCourseById);
courseRouter.post('/', createCourse);
courseRouter.patch('/:id', updateCourse);
courseRouter.delete('/:id', deleteCourse);

module.exports = courseRouter;