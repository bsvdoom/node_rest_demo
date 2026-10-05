const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { matchedData } = require('express-validator');
const config = require('../config/auth.config');
const User = require('../models/user.model');
const Role = require('../models/role.model');

const PASSWORD_WORK_FACTOR = 12;
const dummyPasswordHash = bcrypt.hash('invalid-user-password', PASSWORD_WORK_FACTOR);

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

exports.signup = async (req, res) => {
    const data = matchedData(req, { locations: ['body'] });
    const roleNames = data.roles || ['user'];
    const roles = await Role.find({ name: { $in: roleNames } });

    if (roles.length !== roleNames.length) {
        throw httpError(503, 'Required roles are not initialized');
    }

    if (await User.exists({ email: data.email })) {
        throw httpError(409, 'A user with this email already exists');
    }

    const user = new User({
        first_name: data.first_name,
        family_name: data.family_name,
        email: data.email,
        tel: data.tel,
        facebook: data.facebook,
        password: await bcrypt.hash(data.password, PASSWORD_WORK_FACTOR),
        date_of_birth: data.date_of_birth,
        active: true,
        roles: roles.map(role => role._id)
    });

    await user.save();
    return res.status(201).json({ message: 'User was registered successfully' });
};

exports.signin = async (req, res) => {
    const data = matchedData(req, { locations: ['body'] });
    const user = await User.findOne({ email: data.email })
        .select('+password')
        .populate('roles', 'name');
    const passwordHash = user && user.password ? user.password : await dummyPasswordHash;
    const passwordIsValid = await bcrypt.compare(data.password, passwordHash);

    if (!user || !passwordIsValid || !user.active) {
        throw httpError(401, 'Invalid email or password');
    }

    const token = jwt.sign({}, config.secret, {
        algorithm: config.algorithm,
        issuer: config.issuer,
        audience: config.audience,
        subject: user.id,
        expiresIn: config.expiresIn
    });

    return res.status(200).json({
        id: user._id,
        first_name: user.first_name,
        family_name: user.family_name,
        email: user.email,
        tel: user.tel,
        facebook: user.facebook,
        date_of_birth: user.date_of_birth,
        roles: user.roles.filter(Boolean).map(role => role.name),
        accessToken: token
    });
};

exports.delete = async (req, res) => {
    const { email } = matchedData(req, { locations: ['body'] });
    const deletedUser = await User.findOneAndDelete({ email });

    if (!deletedUser) {
        throw httpError(404, 'User not found');
    }

    return res.json({ message: 'User was deleted successfully' });
};
