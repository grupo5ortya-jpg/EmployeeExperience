
const { Router } = require('express');
const router = Router();
const surveyTypes = require('../controllers/survey_type.controllers');

router.get('/',       surveyTypes.getAllSurveyTypes);
router.get('/:id',    surveyTypes.getSurveyTypeById);
router.post('/',      surveyTypes.createSurveyType);
router.patch('/:id',  surveyTypes.updateSurveyType);
router.delete('/:id', surveyTypes.deleteSurveyType);

module.exports = router;
