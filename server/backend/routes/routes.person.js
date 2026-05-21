
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Person routes' });
});

//? Evaluar si es necesario este endpoint específico para obtener una persona por uuid o auth0_id, o si se manejará a través de la ruta de usuario (User) u otro mecanismo de autenticación
router.get('/:text', (req, res) => {
	const { text } = req.params;
	// Lógica para obtener un persona por extracto de texto del nombre o apellido
	res.json({ message: `Get person with text ${text}` });
});

//? Evaluar si es necesario este endpoint específico para obtener una persona por uuid o auth0_id, o si se manejará a través de la ruta de usuario (User) u otro mecanismo de autenticación
router.post('/create', (req, res) => {
	// Lógica para crear un nuevo persona
	res.json({ message: 'Create a new person' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	//! Puede que el "uuid" sea reemplazado por "auth0_id" o algo similar dependiendo de cómo se maneje la autenticación
	// Lógica para actualizar un persona por uuid
	res.json({ message: `Update person with uuid ${uuid}` });
});


module.exports = router;
