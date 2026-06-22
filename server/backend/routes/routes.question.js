
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const questions = require('../controllers/question.controllers');

router.get('/feedback360',  questions.getFeedback360Questions);
router.get('/',             questions.getAllQuestions);
router.get('/:id',          questions.getQuestionById);
router.post('/',      authorize('Talento'), questions.createQuestion);
router.patch('/:id',  authorize('Talento'), questions.updateQuestion);
router.delete('/:id', authorize('Talento'), questions.deleteQuestion);

module.exports = router;
