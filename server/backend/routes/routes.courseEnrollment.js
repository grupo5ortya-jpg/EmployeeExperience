
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const enrollments = require('../controllers/courseEnrollment.controller');

router.get('/', enrollments.getAllEnrollments);
router.post('/', enrollments.createEnrollment);
router.post('/external', enrollments.createExternalCertification);
router.patch('/:id/progress', enrollments.updateProgress);
router.patch('/:id/request-completion', enrollments.requestCompletion);
router.patch('/:id/review', authorize('Talento'), enrollments.reviewCompletion);

module.exports = router;
