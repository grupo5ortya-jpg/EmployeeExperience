
const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Survey routes' });
});

router.get('/:uuid', (req, res) => {
	const { uuid } = req.params;
	// Lógica para obtener un Survey por extracto de uuid del nombre o apellido
	res.json({ message: `Get survey with uuid ${uuid}` });
});

router.post('/create', (req, res) => {
	// Lógica para crear un nuevo survey
	res.json({ message: 'Create a new survey' });
});

router.patch('/:uuid', (req, res) => {
	const { uuid } = req.params;
	//! Puede que el "uuid" sea reemplazado por "auth0_id" o algo similar dependiendo de cómo se maneje la autenticación
	// Lógica para actualizar un survey por uuid
	res.json({ message: `Update survey with uuid ${uuid}` });
});


module.exports = router;
