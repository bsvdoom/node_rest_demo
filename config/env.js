const fs = require('fs');

module.exports = function requireEnv(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
};

module.exports.fromFile = function requireEnvFile(name) {
    const filePath = module.exports(name);
    let value;

    try {
        value = fs.readFileSync(filePath, 'utf8').replace(/[\r\n]+$/, '');
    } catch (err) {
        throw new Error(`Cannot read secret file configured by ${name}: ${err.message}`);
    }

    if (!value) {
        throw new Error(`Secret file configured by ${name} is empty`);
    }

    return value;
};
