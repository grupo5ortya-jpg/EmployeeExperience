
const { Sequelize } = require('sequelize');
const { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, DB_PORT } = process.env;


const sequelize = new Sequelize(
	DB_NAME, DB_USER, DB_PASSWORD,
	{
		host: DB_HOST,
		dialect: DB_DIALECT,
		port: DB_PORT,
		logging: false,
		native: false,
	}
);


module.exports = {
	sequelize
};
