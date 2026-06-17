
const { Router }     = require('express');
const router         = Router();
const { authorize }  = require('../middlewares/authorize');
const { generatePlan, getHistory, getActive } = require('../controllers/careerSimulator.controller');

// Colaborador: solo su propio plan (self-check en el controller)
// Talento: puede consultar/generar para cualquier empleado
router.post('/',                   authorize('Colaborador', 'Talento'), generatePlan);
router.get('/:employeeId/active',  authorize('Colaborador', 'Talento'), getActive);
router.get('/:employeeId',         authorize('Colaborador', 'Talento'), getHistory);

module.exports = router;
