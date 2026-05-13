
const server = require('./server.js');
const { sequelize } = require('./connection/sequelize.js');
const { core_conn_initialize_database } = require('./connection/connection.js');
const { core_conn_ensure_database } = require('./connection/utiles.js');
const { PORT, DB_NAME } = process.env;


async function core_start_server() {
	try {
		// Inicializar base de datos con tipos personalizados
		await core_conn_ensure_database(DB_NAME);
		await core_conn_initialize_database(sequelize);

		// Iniciar servidor
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});

	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}


core_start_server();
