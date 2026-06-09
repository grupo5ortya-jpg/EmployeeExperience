
const { Router }            = require('express');
const router                = Router();
const routes_auth           = require('./routes.auth.js');
const { authenticateToken } = require('../middleware/authenticateToken');
// TODO: eliminar este import cuando se quite el endpoint de admin/cron (solo para pruebas)
const { assignDuePulseSurveys } = require('../connection/pulseCronJob.js');
// TODO: eliminar — solo para pruebas de desarrollo
const { checkOverdueTasks }     = require('../connection/onboardingCronJob.js');
const routes_question = require('./routes.question.js');
const routes_question_type = require('./routes.question_type.js');
const routes_department = require('./routes.department.js');
const routes_employee = require('./routes.employee.js');
const routes_person = require('./routes.person.js');
const routes_role = require('./routes.role.js');
const routes_question_option = require('./routes.question_option.js');
const routes_employee_task = require('./routes.employee_task.js');
const routes_task = require('./routes.task.js');
const routes_survey = require('./routes.survey.js');
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
const routes_alert = require('./routes.alert.js');
const routes_feedback_assignment = require('./routes.feedback_assignment.js');
const routes_job_opening = require('./routes.jobOpening')
const routes_skills = require('./routes.skill.js')
const routes_continuous_feedback = require('./routes.continuousFeedback.js');
const routes_okr = require('./routes.okr.js');


// Auth — public, must be first
router.use('/auth', routes_auth);

// All routes below require a valid JWT cookie
router.use(authenticateToken);

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
router.use('/survey', routes_survey);

// Mount employee task routes
router.use('/employee-task', routes_employee_task);

// Mount task routes
router.use('/task', routes_task);

// Mount question option routes
router.use('/question-option', routes_question_option);

// Mount employee routes
router.use('/employees', routes_employee);

// Mount question routes
router.use('/question', routes_question);

// Mount department routes
router.use('/department', routes_department);

// Mount person routes
router.use('/person', routes_person);

// Mount question type routes
router.use('/question-type', routes_question_type);

// Mount role routes
router.use('/role', routes_role);

// Mount survey response routes
router.use('/survey-response', routes_survey_response);

// Mount continuous feedback routes
router.use('/continuous-feedback', routes_continuous_feedback);

// Mount OKR routes
router.use('/okr', routes_okr);

//gemini
router.post('/api/gemini/preguntar', preguntarAGemini);

// Alerts
router.use('/alerts', routes_alert);
// Feedback 360 assignments
router.use('/feedback-assignment', routes_feedback_assignment);

// Pulse surveys — pending by employee
router.get('/pulse-surveys/pending', getPendingPulseSurveys);
// Pulse analyses — all AI results for HR
router.get('/pulse-surveys/analyses', getPulseAnalyses);

// AI — mentor matching
router.post('/ai/mentor-matching', getMentorSuggestions);
// Job openings
router.use('/job-openings', routes_job_opening)
// Skills
router.use('/skills', routes_skills)


// TODO: eliminar estos endpoints — solo para pruebas de desarrollo
router.post('/admin/cron/onboarding-run', async (_req, res, next) => {
    try {
        await checkOverdueTasks();
        res.json({ ok: true, message: 'Onboarding cron ejecutado manualmente.' });
    } catch (err) { next(err); }
});

router.post('/admin/cron/pulse-run', async (_req, res, next) => {
    try {
        await assignDuePulseSurveys();
        res.json({ ok: true, message: 'Pulse cron ejecutado manualmente.' });
    } catch (err) {
        next(err);
    }
});

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
