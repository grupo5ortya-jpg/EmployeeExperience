const { Router } = require('express');
const { getAssignments, generateAssignments, updateAssignment } = require('../controllers/feedbackAssignment.controllers');

const router = Router();

router.get('/',           getAssignments);
router.post('/generate',  generateAssignments);
router.patch('/:id',      updateAssignment);

module.exports = router;
