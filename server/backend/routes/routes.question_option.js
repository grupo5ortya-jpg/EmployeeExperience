
const { Router } = require('express');
const router = Router();
const options = require('../controllers/question_option.controllers');

router.get('/',       options.getAllOptions);
router.get('/:id',    options.getOptionById);
router.post('/',      options.createOption);
router.patch('/:id',  options.updateOption);
router.delete('/:id', options.deleteOption);

module.exports = router;
