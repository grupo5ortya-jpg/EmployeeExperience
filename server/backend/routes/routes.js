
const { Router } = require('express');
const router = Router();
const question_routes = require('./routes.question.js');
const question_type_routes = require('./routes.question_type.js');
const department_routes = require('./routes.department.js');
const employee_routes = require('./routes.employee.js');
const person_routes = require('./routes.person.js');
const role_routes = require('./routes.role.js');
const question_option_routes = require('./routes.question_option.js');
const employee_task_routes = require('./routes.employee_task.js');
const task_routes = require('./routes.task.js');
const survey_routes = require('./routes.survey.js');
const routes_task = require('./routes.task.js');
const routes_user = require('./routes.user.js');
const routes_team = require('./routes.team.js');
const routes_task_type = require('./routes.task_type.js');
const routes_survey_type = require('./routes.survey_type.js');
const routes_survey_assignment = require('./routes.survey_assignment.js');
const routes_survey_response = require('./routes.survey_response.js');
const { preguntarAGemini } = require('../controllers/geminiController.js');

// Mount task type routes
router.use('/task-type', routes_task_type);

// Mount team routes
router.use('/team', routes_team);

// Mount survey type routes
router.use('/survey-type', routes_survey_type);

// Mount survey assignment routes
router.use('/survey-assignment', routes_survey_assignment);

// Mount user routes
router.use('/user', routes_user);

// Mount survey routes
router.use('/survey', survey_routes);

// Mount employee task routes
router.use('/employee-task', employee_task_routes);

// Mount task routes
router.use('/task', task_routes);

// Mount question option routes
router.use('/question-option', question_option_routes);

// Mount employee routes
router.use('/employees', employee_routes);

// Mount question routes
router.use('/question', question_routes);

// Mount department routes
router.use('/department', department_routes);

// Mount person routes
router.use('/person', person_routes);

// Mount question type routes
router.use('/question-type', question_type_routes);

// Mount role routes
router.use('/role', role_routes);

// Mount survey response routes
router.use('/survey-response', routes_survey_response);

//gemini
router.post('/api/gemini/preguntar', preguntarAGemini);

module.exports = router;
