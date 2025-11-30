// backend/middleware/errorHandler.js

// Global error handling middleware
export function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // Default error
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific error types
    if (err.code === 'ER_DUP_ENTRY') {
        statusCode = 400;
        message = 'Duplicate entry - Record already exists';
    }

    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = 400;
        message = 'Invalid reference - Related record does not exist';
    }

    if (err.code === 'ER_BAD_FIELD_ERROR') {
        statusCode = 500;
        message = 'Database schema error - Invalid field';
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token expired';
    }

    // Ensure we always send JSON
    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
}

// 404 handler
export function notFoundHandler(req, res, next) {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl
    });
}

// Async error wrapper
export function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}