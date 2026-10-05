const requireEnv = require('./env');

const secret = requireEnv.fromFile('JWT_SECRET_FILE');

if (Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT secret must contain at least 32 bytes');
}

module.exports = {
    secret,
    algorithm: 'HS256',
    issuer: requireEnv('JWT_ISSUER'),
    audience: requireEnv('JWT_AUDIENCE'),
    expiresIn: '24h'
};
