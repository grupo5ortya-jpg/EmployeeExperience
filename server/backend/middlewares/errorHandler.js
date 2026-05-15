const {
    ValidationError,
    UniqueConstraintError,
    ForeignKeyConstraintError,
    DatabaseError,
} = require('sequelize');

const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal server error';

    if (error instanceof ValidationError) {
        statusCode = 400;
        message = error.errors.map((err) => err.message).join(', ');
    }

    if (error instanceof UniqueConstraintError) {
        statusCode = 409;
        message = error.errors.map((err) => err.message).join(', ');
    }

    if (error instanceof ForeignKeyConstraintError) {
        statusCode = 400;
        message = 'Invalid related resource reference';
    }

    if (error instanceof DatabaseError && statusCode === 500) {
        message = 'Database error';
    }

    return res.status(statusCode).json({
        status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
        message,
        ...(process.env.NODE_ENV !== 'production' && { error: error.message }),
    });
};

module.exports = { errorHandler };