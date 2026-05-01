
const path = require('path');
const { core_conn_execute_query_from_file } = require('./utiles.js');


async function core_conn_initialize_database(sequelize) {
	try {
		//! TODO: Agregar un FOR
			// const typesPath = path.join(__dirname, '..', 'test.sql');
			// await core_conn_execute_query_from_file(sequelize, typesPath);
		// sincronizar modelos con la base de datos
		await sequelize.sync(JSON.parse(process.env.SYNC_PARAMS));

		return true;
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
}


module.exports = {
	core_conn_initialize_database
};
