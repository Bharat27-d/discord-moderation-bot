const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

async function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader. split(' ')[1];
        
        if (!token) {
            return res.status(401). json({ error: 'No token provided' });
        }
        
        const decoded = jwt.verify(token, config.jwtSecret);
        
        const user = await User.findOne({ discordId: decoded.userId });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
}

module.exports = { authenticateToken };