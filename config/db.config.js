const requireEnv = require('./env');

const host = requireEnv('MONGODB_HOST');
const port = requireEnv('MONGODB_PORT');
const database = requireEnv('MONGODB_DATABASE');
const username = requireEnv('MONGODB_USER');
const password = requireEnv.fromFile('MONGODB_PASSWORD_FILE');

module.exports = {
    url: `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}` +
        `@${host}:${port}/${encodeURIComponent(database)}` +
        `?authSource=${encodeURIComponent(database)}`
};
