const bcrypt = require('bcryptjs');
const requireEnv = require('../config/env');
const { connect, disconnect, user: User, role: Role, ROLES } = require('../models');

const PASSWORD_WORK_FACTOR = 12;

async function seedAdmin() {
    const password = requireEnv.fromFile('ADMIN_PASSWORD_FILE');
    if (password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
        throw new Error('Admin password must contain at least 12 characters and at most 72 UTF-8 bytes');
    }

    const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase();
    const profile = {
        first_name: requireEnv('ADMIN_FIRST_NAME').trim(),
        family_name: requireEnv('ADMIN_FAMILY_NAME').trim(),
        tel: requireEnv('ADMIN_TEL').trim()
    };

    await connect();

    await Promise.all(ROLES.map(name => Role.updateOne(
        { name },
        { $setOnInsert: { name } },
        { upsert: true }
    )));

    const roles = await Role.find({ name: { $in: ROLES } });
    if (roles.length !== ROLES.length) {
        throw new Error('Could not initialize all required roles');
    }
    let admin = await User.findOne({ email }).select('+password');

    if (!admin) {
        admin = new User({
            ...profile,
            email,
            password: await bcrypt.hash(password, PASSWORD_WORK_FACTOR),
            active: true,
            roles: roles.map(role => role._id)
        });
        await admin.save();
        console.log(`Created initial admin '${email}'`);
        return;
    }

    admin.set({
        ...profile,
        active: true,
        roles: roles.map(role => role._id)
    });

    if (!admin.password || !await bcrypt.compare(password, admin.password)) {
        admin.password = await bcrypt.hash(password, PASSWORD_WORK_FACTOR);
    }

    await admin.save();
    console.log(`Updated initial admin '${email}'`);
}

seedAdmin()
    .catch(error => {
        console.error('Admin seed failed', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await disconnect().catch(error => {
            console.error('Database cleanup failed', error);
            process.exitCode = 1;
        });
    });
