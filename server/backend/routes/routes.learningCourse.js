
const { Router } = require('express');
const router = Router();
const courses = require('../controllers/learningCourse.controller');

router.get('/', courses.getAllCourses);
router.get('/:id', courses.getCourseById);
router.post('/', courses.createCourse);
router.patch('/:id', courses.updateCourse);
router.delete('/:id', courses.deleteCourse);

module.exports = router;
