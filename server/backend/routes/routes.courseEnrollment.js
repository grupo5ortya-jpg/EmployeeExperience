
const { Router } = require('express');
const router = Router();
const enrollments = require('../controllers/courseEnrollment.controller');

router.get('/', enrollments.getAllEnrollments);
router.post('/', enrollments.createEnrollment);
router.patch('/:id/progress', enrollments.updateProgress);
router.patch('/:id/request-completion', enrollments.requestCompletion);
router.patch('/:id/review', enrollments.reviewCompletion);

module.exports = router;
