const requireEnv = require('./env');

module.exports = {
    json_transport: process.env.SMTP_JSON_TRANSPORT === 'true',
    service: requireEnv('SMTP_SERVICE'),
    auth_user: requireEnv('SMTP_USER'),
    auth_pass: requireEnv.fromFile('SMTP_PASS_FILE'),
    from: requireEnv('SMTP_FROM'),
};
