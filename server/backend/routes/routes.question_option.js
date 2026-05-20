
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Question option routes' });
});

router.get('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para obtener una opción de pregunta por UUID
	res.json({ message: `Get question option with UUID ${uuid}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear una nueva opción de pregunta
	res.json({ message: 'Create a new question option' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para actualizar una opción de pregunta por UUID
	res.json({ message: `Update question option with UUID ${uuid}` });
});

router.delete('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para eliminar una opción de pregunta por UUID
	res.json({ message: `Delete question option with UUID ${uuid}` });
});

module.exports = router;
