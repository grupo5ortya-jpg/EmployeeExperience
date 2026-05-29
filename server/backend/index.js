
require('dotenv').config();
const server = require('./server.js');
const { sequelize } = require('./connection/sequelize');
const { core_conn_initialize_database_from_bs } = require('./connection/connection.js');
const { core_conn_ensure_database } = require('./connection/utiles.js');
const { core_conn_apply_associations } = require('./connection/relations.js');
const { PORT, DB_NAME, SYNC_PARAMS } = process.env;
const fs = require('fs');
const path = require('path');
const core_seed_database = require('./seeders/seeds.js');
const { startPulseCronJob } = require('./connection/pulseCronJob.js');


async function core_start_server() {
	try {
		// Inicializar base de datos con tipos personalizados y esquema
		await core_conn_ensure_database(DB_NAME);
		await core_conn_initialize_database_from_bs(sequelize);

		// Registrar modelos y asociarlos antes de sincronizar
		await core_conn_apply_associations(sequelize);
		await sequelize.sync(JSON.parse(SYNC_PARAMS));

		// Sembrar datos iniciales - De prueba, se puede comentar después
		await core_seed_database(sequelize);

		console.log('Database initialized and models synchronized successfully');

		// Iniciar servidor
		server.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});

		startPulseCronJob();

	} catch (error) {
		console.error('Failed to start server:', error);
		process.exit(1);
	}
}

// start()
core_start_server();
