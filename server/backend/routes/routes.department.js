
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Department routes' });
});

router.get('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para obtener un departamento por nombre
	res.json({ message: `Get department with name ${name}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo departamento
	res.json({ message: 'Create a new department' });
});

router.patch('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para actualizar un departamento por nombre
	res.json({ message: `Update department with name ${name}` });
});

router.delete('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para eliminar un departamento por nombre
	res.json({ message: `Delete department with name ${name}` });
});

module.exports = router;
