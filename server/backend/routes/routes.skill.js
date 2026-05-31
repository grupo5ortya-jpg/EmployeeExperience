const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skill.controller');

router.get('/', skillController.getAll);
router.post('/', skillController.create);

module.exports = router;