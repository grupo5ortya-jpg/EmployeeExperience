
const { Router } = require('express');
const router = Router();
const { authorize } = require('../middlewares/authorize');
const users = require('../controllers/user.controllers');

router.get('/',       users.getAllUsers);
router.get('/:id',    users.getUserById);
router.post('/',      users.createUser);
router.patch('/:id',  authorize('Talento'), users.updateUser);
router.delete('/:id', authorize('Talento'), users.deleteUser);

module.exports = router;
