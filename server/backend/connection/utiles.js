
const fs = require('fs');
const { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT } = process.env;
const pgtools = require('pgtools');


async function core_conn_ensure_database(p_db_name) {
	try {
		await pgtools.createdb({
			user: DB_USER,
			password: DB_PASSWORD,
			port: DB_PORT,
			host: DB_HOST
		}, p_db_name);

		console.log(`✅ Database "${p_db_name}" created successfully`);
	} catch (err) {
		if (err.name === 'duplicate_database') {
			console.log(`ℹ️ Database "${p_db_name}" already exists`);
		} else {
			throw err;
		}
	}
}


async function core_conn_execute_query_from_file(sequelize, filePath) {
	if (fs.existsSync(filePath)) {
		const sql = fs.readFileSync(filePath, 'utf8');
		try {
			await sequelize.query(sql);
			console.log(`${filePath} executed`);
		} catch (err) {
			// Ignorar tipo ya existe (42710) u otros errores idempotentes
			const code = err && err.parent && err.parent.code;
			if (code === '42710') {
				console.warn('Warning: los Custom DataTYPEs ya han sido creados - continuando');
			} else {
				throw err;
			}
		}
	}
}


module.exports = {
	core_conn_ensure_database,
	core_conn_execute_query_from_file
};
