
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'employee routes' });
});

router.get('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para obtener un employeea por extracto de uuid del nombre o apellido
	res.json({ message: `Get employee with uuid ${uuid}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo employeea
	res.json({ message: 'Create a new employee' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	//! Puede que el "uuid" sea reemplazado por "auth0_id" o algo similar dependiendo de cómo se maneje la autenticación
	// Lógica para actualizar un employeea por uuid
	res.json({ message: `Update employee with uuid ${uuid}` });
});


module.exports = router;
