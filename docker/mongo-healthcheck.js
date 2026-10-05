const fs = require('fs');

const username = fs
    .readFileSync('/run/secrets/mongo_root_username', 'utf8')
    .replace(/[\r\n]+$/, '');
const password = fs
    .readFileSync('/run/secrets/mongo_root_password', 'utf8')
    .replace(/[\r\n]+$/, '');
const uri = `mongodb://${encodeURIComponent(username)}:${encodeURIComponent(password)}` +
    '@127.0.0.1:27017/admin?authSource=admin';
const adminDb = connect(uri);
const result = adminDb.runCommand({ ping: 1 });

quit(result.ok === 1 ? 0 : 1);
