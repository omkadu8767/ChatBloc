const jwt = require("jsonwebtoken");

function protect(req, _res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("Unauthorized: Missing token");
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            id: decoded.id,
            email: decoded.email,
        };
        return next();
    } catch (_error) {
        const error = new Error("Unauthorized: Invalid token");
        error.statusCode = 401;
        return next(error);
    }
}

module.exports = { protect };
