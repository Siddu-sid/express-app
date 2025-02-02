
// JWT configuration and middleware setup
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'testtoken@1234';
const { redisClient } = require("./redis");
const { log } = require('console');

const verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Decoded Token:', decoded);
        const redisToken = await redisClient.get(`token:${decoded.username}`);
        log('Redis Token:', redisToken);
        log('Token:', token);

        if (!redisToken) {
            return res.status(401).json({ message: 'Token not found in Redis or It may be expired' });
        }
        // Optionally, you can check if the token stored in Redis matches the decoded token
        if (token !== redisToken) {
            return res.status(401).json({ message: 'Invalid token data' });
        }
        // ✅ Check if user has the required role (e.g., 'admin')
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        console.error('JWT Verification Error:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
    verifyToken,
    generateToken
};