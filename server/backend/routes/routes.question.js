
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Question routes' });
});

router.get('/byType/:text', (req, res) => {
	const { text } = req.params;
	// Lógica para obtener preguntas por extracto de texto del tipo de pregunta
	res.json({ message: `Get questions with question type text ${text}` });
});

router.get('/:text', (req, res) => {
	const { text } = req.params;
	// Lógica para obtener una pregunta por extracto de texto del nombre o apellido
	res.json({ message: `Get question with text ${text}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo pregunta
	res.json({ message: 'Create a new question' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	//! Puede que el "uuid" sea reemplazado por "auth0_id" o algo similar dependiendo de cómo se maneje la autenticación
	// Lógica para actualizar un pregunta por uuid
	res.json({ message: `Update question with uuid ${uuid}` });
});


module.exports = router;
