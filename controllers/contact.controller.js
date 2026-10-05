const nodemailer = require('nodemailer');
const { matchedData } = require('express-validator');
const Contact = require('../models/contact.model');
const Role = require('../models/role.model');
const User = require('../models/user.model');
const config = require('../config/email.config.js');

const transporter = nodemailer.createTransport(config.json_transport
    ? { jsonTransport: true }
    : {
        service: config.service,
        auth: {
            user: config.auth_user,
            pass: config.auth_pass
        }
    });

function httpError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
}

async function findAdminEmail() {
    const adminRole = await Role.findOne({ name: 'admin' }).select('_id').lean();
    if (!adminRole) {
        throw httpError(503, 'Contact notification is not configured');
    }

    const admin = await User.findOne({ roles: adminRole._id, active: true })
        .select('email')
        .lean();
    if (!admin) {
        throw httpError(503, 'Contact notification is not configured');
    }

    return admin.email;
}

exports.create = async (req, res) => {
    const data = matchedData(req, { locations: ['body'] });
    const adminEmail = await findAdminEmail();
    const contact = await Contact.create(data);

    try {
        await transporter.sendMail({
            from: config.from,
            to: adminEmail,
            bcc: contact.email,
            subject: 'Contact us form',
            html: '<h1>Thank you for contacting us!</h1><p>We will reply shortly!</p>'
        });
    } catch (cause) {
        const error = httpError(502, 'Contact was saved, but the notification could not be delivered');
        error.cause = cause;
        throw error;
    }

    return res.status(201).json(contact);
};

exports.findAll = async (req, res) => {
    const contacts = await Contact.find()
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    return res.json(contacts);
};
