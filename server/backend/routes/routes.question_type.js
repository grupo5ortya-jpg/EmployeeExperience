
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Question type routes' });
});

router.get('/:text', (req, res) => {
	const { text } = req.params;
	// Lógica para obtener un tipo de pregunta por nombre
	res.json({ message: `Get question type with text ${text}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo tipo de pregunta
	res.json({ message: 'Create a new question type' });
});

router.patch('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para actualizar un tipo de pregunta por nombre
	res.json({ message: `Update question type with name ${name}` });
});

router.delete('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para eliminar un tipo de pregunta por nombre
	res.json({ message: `Delete question type with name ${name}` });
});

module.exports = router;
