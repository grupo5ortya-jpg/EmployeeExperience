const express = require('express');
const router = express.Router();

const jobOpeningController = require('../controllers/jobOpening.controller');

router.get('/', jobOpeningController.getAll);
router.get('/:id', jobOpeningController.getById);
router.post('/', jobOpeningController.create);
router.put('/:id', jobOpeningController.update);
router.delete('/:id', jobOpeningController.remove);

module.exports = router;