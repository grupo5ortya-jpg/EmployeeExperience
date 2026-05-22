
const { Router } = require('express');
const router = Router();
const surveys = require('../controllers/survey.controllers');

router.get('/',       surveys.getAllSurveys);
router.get('/:id',    surveys.getSurveyById);
router.post('/',      surveys.createSurvey);
router.patch('/:id',  surveys.updateSurvey);
router.delete('/:id', surveys.deleteSurvey);

module.exports = router;
