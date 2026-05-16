const { Router } = require("express");
const UserController = require("../controllers/users.controllers.js");
const router = Router();

router.get('/users', async (req, res, next) => {
    try {
        const allUsers = await UserController.getAllUsers();
        if (!allUsers) res.status(404).json({ error: "Not found" })
    }
    catch (error) {
        console.error("GET /users");
        next(error);
    }
})

module.exports = router;