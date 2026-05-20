
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Question type routes' });
});

router.get('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para obtener un tipo de pregunta por ID
	res.json({ message: `Get question type with uuid ${uuid}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo tipo de pregunta
	res.json({ message: 'Create a new question type' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para actualizar un tipo de pregunta por ID
	res.json({ message: `Update question type with uuid ${uuid}` });
});

router.delete('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para eliminar un tipo de pregunta por ID
	res.json({ message: `Delete question type with uuid ${uuid}` });
});

module.exports = router;
