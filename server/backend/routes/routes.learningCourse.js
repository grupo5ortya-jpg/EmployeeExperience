
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const courses = require('../controllers/learningCourse.controller');

router.get('/', courses.getAllCourses);
router.get('/:id', courses.getCourseById);
router.post('/', authorize('Talento'), courses.createCourse);
router.patch('/:id', authorize('Talento'), courses.updateCourse);
router.delete('/:id', authorize('Talento'), courses.deleteCourse);

module.exports = router;
