
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const questionTypes = require('../controllers/question_type.controllers');

router.get('/',       questionTypes.getAllQuestionTypes);
router.get('/:id',    questionTypes.getQuestionTypeById);
router.post('/',      authorize('Talento'), questionTypes.createQuestionType);
router.patch('/:id',  authorize('Talento'), questionTypes.updateQuestionType);
router.delete('/:id', authorize('Talento'), questionTypes.deleteQuestionType);

module.exports = router;
