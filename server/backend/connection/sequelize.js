
const { Sequelize } = require('sequelize');
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, DB_PORT, DB_SCHEMA } = process.env;
const { core_conn_upload_models } = require('./models.upload.js');
const schema = DB_SCHEMA ? DB_SCHEMA.trim() : 'public';
const searchPath = schema ? `${schema},public` : 'public';


const sequelize = new Sequelize(
	DB_NAME, DB_USER, DB_PASSWORD,
	{
		host: DB_HOST,
		dialect: DB_DIALECT || 'postgres',
		port: DB_PORT,
		logging: false,
		native: false,
		searchPath,
		dialectOptions: {
			options: `-c search_path=${searchPath}`
		}
	}
);


sequelize.models = core_conn_upload_models(sequelize);

module.exports = {
	sequelize,
	...sequelize.models
};
