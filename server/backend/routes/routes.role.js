const { Router } = require('express');
const router = Router();


router.get('/all', (req, res) => {
	res.json({ message: 'Roles routes' });
});

router.get('/:name', (req, res) => {
	const { name } = req.params;
	// Lógica para obtener un tipo de pregunta por nombre
	res.json({ message: `Get Role with name ${name}` });
});


module.exports = router;
