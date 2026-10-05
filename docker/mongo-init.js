const fs = require('fs');

const databaseName = process.env.MONGO_APP_DATABASE;
const username = process.env.MONGO_APP_USERNAME;
const password = fs
    .readFileSync(process.env.MONGO_APP_PASSWORD_FILE, 'utf8')
    .replace(/[\r\n]+$/, '');

if (!databaseName || !username || !password) {
    throw new Error('Mongo application database, username and password are required');
}

const applicationDb = db.getSiblingDB(databaseName);
const roles = [{ role: 'readWrite', db: databaseName }];

if (applicationDb.getUser(username)) {
    applicationDb.updateUser(username, { pwd: password, roles });
    print(`Updated application user '${username}' in '${databaseName}'`);
} else {
    applicationDb.createUser({ user: username, pwd: password, roles });
    print(`Created application user '${username}' in '${databaseName}'`);
}
