
const { Router } = require('express');
const router = Router();
const users = require("./users.routes.js");
const employeeRouter = require('./employee.routes');
const courseRouter = require('./course.routes');
const courseEnrollmentRouter = require('./course.enrollment.routes.js');
// Mount routes
//* User - Services
router.use('/', users);
router.use('/employees', employeeRouter);
router.use('/courses', courseRouter);
router.use('/course-enrollments', courseEnrollmentRouter);



module.exports = router;
