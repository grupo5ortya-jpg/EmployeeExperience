
const server = require('./server.js');
//const { sequelize } = require('./connection/sequelize');
const { core_conn_initialize_database } = require('./connection/connection.js');
const { core_conn_ensure_database } = require('./connection/utiles.js');
const { PORT, DB_NAME } = process.env;

const { sequelize } = require('./models');
async function start() {

	await sequelize.authenticate();
	await sequelize.sync({ alter: true });
	server.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
}
// async function core_start_server() {
// 	try {
// 		// Inicializar base de datos con tipos personalizados
// 		await core_conn_ensure_database(DB_NAME);
// 		await core_conn_initialize_database(sequelize);
// 		//sincronización sequelize, alter mantiene la base,
// 		// si usamos force se reinicia cada vez que levantamos el servidor
// 		await sequelize.sync({ alter: true });
// 		console.log('Models synchronized successfully');

// 		// Iniciar servidor
// 		server.listen(PORT, () => {
// 			console.log(`Server running on port ${PORT}`);
// 		});

// 	} catch (error) {
// 		console.error('Failed to start server:', error);
// 		process.exit(1);
// 	}
// }

start()
// core_start_server();
