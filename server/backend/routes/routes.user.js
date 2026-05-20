
const { Router } = require('express');
const router = Router();


router.get('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para obtener todas las tareas de un empleado por UUID
	res.json({ message: `Get user task with uuid ${uuid}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo empleado
	res.json({ message: 'Create a new User' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para actualizar un empleado por UUID
	res.json({ message: `Update user with uuid ${uuid}` });
});

router.delete('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para eliminar un empleado por UUID
	res.json({ message: `Delete user with uuid ${uuid}` });
});

module.exports = router;
