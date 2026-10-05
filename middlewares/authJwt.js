const jwt = require('jsonwebtoken');
const config = require('../config/auth.config.js');
const User = require('../models/user.model');

function verifyToken(req, res, next) {
    const authorization = req.get('authorization');
    const match = authorization && authorization.match(/^Bearer\s+(.+)$/i);

    if (!match) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(match[1], config.secret, {
            algorithms: [config.algorithm],
            issuer: config.issuer,
            audience: config.audience
        });
        req.userId = decoded.sub;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
}

async function isAdmin(req, res, next) {
    const user = await User.findById(req.userId)
        .select('active roles')
        .populate('roles', 'name');

    if (!user || !user.active) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!user.roles.some(role => role && role.name === 'admin')) {
        return res.status(403).json({ message: 'Admin role required' });
    }

    return next();
}

module.exports = { verifyToken, isAdmin };
