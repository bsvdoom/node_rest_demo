const Contact = require('../models/contact.model');
const { validationResult } = require('express-validator');
const config = require("../config/email.config.js");

exports.create = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        message: req.body.message,
        url: req.body.url,
    });

    contact
        .save(contact)
        .then(data => {
            let nodemailer = require('nodemailer');
            let transporter = nodemailer.createTransport({
                service: config.service,
                auth: {
                    user: config.auth_user,
                    pass: config.auth_pass
                }
            });

            let mailOptions = {
                from: config.from,
                to: config.admin_to,
                bcc: data.email,
                subject: 'Contact us form',
                html: '<h1>Thank you for contacting us!</h1><p>We will reply shortly!</p>'
            }

            console.log("Sending mail:");
            console.log(mailOptions);

            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Contact Us form."
            });
        });
};

exports.findAll = (req, res) => {
    const title = req.query.title;
    let condition = title ? { title: { $regex: new RegExp(title), $options: "i" } } : {};

    Contact.find(condition)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving tutorials."
            });
        });
};

module.exports = exports;


