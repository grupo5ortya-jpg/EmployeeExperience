
const { Router }   = require('express');
const router       = Router();
const surveys      = require('../controllers/survey.controllers');
const { authorize } = require('../middleware/authorize');

router.get('/',       surveys.getAllSurveys);
router.get('/:id',    surveys.getSurveyById);
router.post('/',      authorize('Talento'), surveys.createSurvey);
router.patch('/:id',  authorize('Talento'), surveys.updateSurvey);
router.delete('/:id', authorize('Talento'), surveys.deleteSurvey);

module.exports = router;
