
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const options = require('../controllers/question_option.controllers');

router.get('/',       options.getAllOptions);
router.get('/:id',    options.getOptionById);
router.post('/',      authorize('Talento'), options.createOption);
router.patch('/:id',  authorize('Talento'), options.updateOption);
router.delete('/:id', authorize('Talento'), options.deleteOption);

module.exports = router;
