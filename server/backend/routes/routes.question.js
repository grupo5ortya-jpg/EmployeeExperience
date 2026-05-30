
const { Router } = require('express');
const router = Router();
const questions = require('../controllers/question.controllers');

router.get('/feedback360',  questions.getFeedback360Questions);
router.get('/',             questions.getAllQuestions);
router.get('/:id',          questions.getQuestionById);
router.post('/',      questions.createQuestion);
router.patch('/:id',  questions.updateQuestion);
router.delete('/:id', questions.deleteQuestion);

module.exports = router;
