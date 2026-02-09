const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

const auth = (req, res, next) => {
    // Skip authentication for public endpoints
    if (req.method === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
        if (!token) {
            throw new Error('No token provided');
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
        req.userData = { userId: decodedToken.userId, email: decodedToken.email };
        next();
    } catch (err) {
        return next(new HttpError('Authentication failed!', 401));
    }
};

module.exports = auth;
