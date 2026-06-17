
const { Router }    = require('express');
const router        = Router();
const { authorize } = require('../middlewares/authorize');
const { getNextSteps } = require('../controllers/nextSteps.controller');

router.get('/', authorize('Colaborador', 'Talento'), getNextSteps);

module.exports = router;
