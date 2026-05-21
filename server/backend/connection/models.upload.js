
const fs = require('fs');
const path = require('path');


function core_conn_upload_models(sequelize) {
	const basename = path.basename(__filename);

	const modelDefiners = [];

	// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
	fs.readdirSync(path.join(__dirname, '../models'))
		.filter(
			(file) =>
				file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js',
		)
		.forEach((file) => {
		modelDefiners.push(require(path.join(__dirname, '../models', file)));
		});

	// Injectamos la conexion (sequelize) a todos los modelos
	modelDefiners.forEach((model) => model(sequelize));
	// Capitalizamos los nombres de los modelos ie: product => Product
	const entries = Object.entries(sequelize.models);
	const capsEntries = entries.map((entry) => [
		entry[0][0].toUpperCase() + entry[0].slice(1),
		entry[1],
	]);
	return Object.fromEntries(capsEntries);
};


module.exports = {
	core_conn_upload_models
};
