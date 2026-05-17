
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/index.routes.js');
const { PROJECT_NAME, ALLOWED_DOMAINS, ALLOWED_METHODS } = process.env;
const { notFound } = require('./middlewares/notFound')
const { errorHandler } = require('./middlewares/errorHandler.js')
const server = express();
server.name = PROJECT_NAME;

server.use(cors());
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));
server.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', ALLOWED_DOMAINS); // update to match the domain you will make the request from
	res.header('Access-Control-Allow-Credentials', 'true');
	// eslint-disable-next-line max-len
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	res.header('Access-Control-Allow-Methods', ALLOWED_METHODS);
	// res.cookie('token', jwt, {
	// 	httpOnly: true,
	// 	secure: true,       // obligatorio en HTTPS
	// 	sameSite: 'None'    // necesario si el frontend está en otro dominio
	// });
	next();
});

server.use('/', routes);
server.use(notFound);
server.use(errorHandler);
server.get('/', (req, res) => {
	res.send('Core service running 🚀');
});

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
	const status = err.status || 500;
	const message = err.message || err;
	res.status(status).send(message);
});

module.exports = server;
