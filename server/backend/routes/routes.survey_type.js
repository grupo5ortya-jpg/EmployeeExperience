
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const surveyTypes = require('../controllers/survey_type.controllers');

router.get('/',       surveyTypes.getAllSurveyTypes);
router.get('/:id',    surveyTypes.getSurveyTypeById);
router.post('/',      authorize('Talento'), surveyTypes.createSurveyType);
router.patch('/:id',  authorize('Talento'), surveyTypes.updateSurveyType);
router.delete('/:id', authorize('Talento'), surveyTypes.deleteSurveyType);

module.exports = router;
