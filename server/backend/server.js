
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const routes = require('./routes/routes.js');
const { PROJECT_NAME, ALLOWED_DOMAINS, ALLOWED_METHODS } = process.env;
const { notFound } = require('./middlewares/notFound')
const { errorHandler } = require('./middlewares/errorHandler.js')
const server = express();
server.name = PROJECT_NAME;

const { FRONTEND_URL } = process.env;
server.use(cors({
	origin:      FRONTEND_URL || 'http://localhost:5173',
	credentials: true,
	methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}));
server.use(express.json({ limit: '50mb' }));
server.use(express.urlencoded({ extended: true, limit: '50mb' }));
server.use(cookieParser());
server.use(morgan('dev'));

server.use('/', routes);
server.use(notFound);
server.use(errorHandler);

module.exports = server;
