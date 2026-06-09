const { Router } = require('express');
const {
    getOkrs,
    getMyOkrs,
    getOkrById,
    createOkr,
    updateOkr,
    updateOkrProgress,
} = require('../controllers/okr.controllers');
const { authorize } = require('../middlewares/authorize');

const router = Router();

router.get('/mine',          authorize('Talento', 'Líder', 'Colaborador'), getMyOkrs);
router.get('/',              authorize('Talento'), getOkrs);
router.post('/',             authorize('Talento'), createOkr);
router.patch('/:id/progress', authorize('Talento', 'Líder', 'Colaborador'), updateOkrProgress);
router.patch('/:id',         authorize('Talento'), updateOkr);
router.get('/:id',           authorize('Talento', 'Líder', 'Colaborador'), getOkrById);

module.exports = router;
