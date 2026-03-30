function notFoundHandler(req, _res, next) {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
}

function errorHandler(error, _req, res, _next) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal server error";

    res.status(statusCode).json({
        success: false,
        message,
    });
}

module.exports = {
    notFoundHandler,
    errorHandler,
};
