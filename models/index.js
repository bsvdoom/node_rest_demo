const dbConfig = require("../config/db.config.js");
const mongoose = require("mongoose");
const Contact = require("./contact.model.js");
const User = require("./user.model.js");
const Role = require("./role.model.js");

async function connect() {
    await mongoose.connect(dbConfig.url, { serverSelectionTimeoutMS: 10000 });
    await Promise.all([Contact.init(), User.init(), Role.init()]);
}

async function disconnect() {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
}

module.exports = {
    mongoose,
    connect,
    disconnect,
    contacts: Contact,
    user: User,
    role: Role,
    ROLES: ["user", "admin"]
};
