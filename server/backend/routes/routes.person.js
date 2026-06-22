
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const persons = require('../controllers/person.controllers');

router.get('/',       persons.getAllPersons);
router.get('/:id',    persons.getPersonById);
router.post('/',      authorize('Talento'), persons.createPerson);
router.patch('/:id',  authorize('Talento'), persons.updatePerson);
router.delete('/:id', authorize('Talento'), persons.deletePerson);

module.exports = router;
