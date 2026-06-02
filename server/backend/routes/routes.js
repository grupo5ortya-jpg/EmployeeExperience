
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
const { getMentorSuggestions } = require('../controllers/mentorController.js');
const { testGeminiConnection } = require('../connection/geminiService.js');
const { getPendingPulseSurveys, getPulseAnalyses } = require('../controllers/pulseSurveyController.js');
const alert_routes = require('./routes.alert.js');
const feedback_assignment_routes = require('./routes.feedback_assignment.js');
const routes_job_opening = require('./routes.jobOpening')
const skillsRoutes = require('./routes.skill.js')

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

// Alerts
router.use('/alerts', alert_routes);
// Feedback 360 assignments
router.use('/feedback-assignment', feedback_assignment_routes);

// Pulse surveys — pending by employee
router.get('/pulse-surveys/pending', getPendingPulseSurveys);
// Pulse analyses — all AI results for HR
router.get('/pulse-surveys/analyses', getPulseAnalyses);

// AI — mentor matching
router.post('/ai/mentor-matching', getMentorSuggestions);
// Job openings
router.use('/job-openings', routes_job_opening)
// Skills
router.use('/skills', skillsRoutes)

// AI — test Gemini connection
router.get('/ai/test', async (_req, res, next) => {
    try {
        const response = await testGeminiConnection();
        res.json({ ok: true, response });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
