
const { Router } = require('express');
const router = Router();
const users = require("./users.routes.js");
//
// Mount routes
//* User - Services
router.use('/', users);




module.exports = router;
