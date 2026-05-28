const { Router } = require('express');
const router = Router();
const geminiController = require('../controllers/geminiController.js');

// Ruta para preguntar a Gemini
router.post('/preguntar', geminiController.preguntarAGemini);
