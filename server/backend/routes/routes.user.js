
const { Router } = require('express');
const router = Router();
const users = require('../controllers/user.controllers');

router.get('/',       users.getAllUsers);
router.get('/:id',    users.getUserById);
router.post('/',      users.createUser);
router.patch('/:id',  users.updateUser);
router.delete('/:id', users.deleteUser);

module.exports = router;
