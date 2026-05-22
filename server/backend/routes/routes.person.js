
const { Router } = require('express');
const router = Router();
const persons = require('../controllers/person.controllers');

router.get('/',       persons.getAllPersons);
router.get('/:id',    persons.getPersonById);
router.post('/',      persons.createPerson);
router.patch('/:id',  persons.updatePerson);
router.delete('/:id', persons.deletePerson);

module.exports = router;
