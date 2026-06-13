
const { Router }    = require('express');
const router        = Router();
const offboarding   = require('../controllers/offboarding.controller');
const { authorize } = require('../middlewares/authorize');

router.get('/',                       authorize('Talento'), offboarding.getAllOffboardings);
router.get('/:employeeId',            authorize('Talento'), offboarding.getOffboardingByEmployee);
router.post('/',                      authorize('Talento'), offboarding.startOffboarding);
router.patch('/:employeeId/complete', authorize('Talento'), offboarding.completeOffboarding);

module.exports = router;
