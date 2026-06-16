
const { Router }    = require('express');
const router        = Router();
const alumni        = require('../controllers/alumni.controller');
const { authorize } = require('../middlewares/authorize');

router.get('/',            authorize('Talento'), alumni.getAllAlumni);
router.get('/:employeeId', authorize('Talento'), alumni.getAlumniByEmployee);
router.patch('/:employeeId', authorize('Talento'), alumni.updateAlumni);
router.patch('/:employeeId/rehire', authorize('Talento'), alumni.rehireAlumni);

module.exports = router;
