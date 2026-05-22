
const { Router } = require('express');
const router = Router();
const questionTypes = require('../controllers/question_type.controllers');

router.get('/',       questionTypes.getAllQuestionTypes);
router.get('/:id',    questionTypes.getQuestionTypeById);
router.post('/',      questionTypes.createQuestionType);
router.patch('/:id',  questionTypes.updateQuestionType);
router.delete('/:id', questionTypes.deleteQuestionType);

module.exports = router;
