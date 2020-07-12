// const db = require("../models/index");
// const Tutorial = db.tutorials;
// const Tutorial = db.tutorials;
// var Tutorial=require('../models/crud-model');
// var mongoose = require('mongoose');
const Contact = require('../models/contact.model');
const { check, validationResult } = require('express-validator');

exports.create = (req, res) => {
    const errors = validationResult(req)
    // console.log(errors.array());
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }
    // Validate request
    // if (!req.body.title) {
    //     res.status(400).send({ message: "Content can not be empty!" });
    //     return;
    // }tel: { type: String, required: true, maxlength: 100},
    // //         email: { type: String, required: true, maxlength: 100},
    // //         name: { type: String, required: true, maxlength: 100},
    // //         message: { type: String, required: true, maxlength: 1000},
    // //         url: { type: String, maxlength: 100},
    //check('name').isLength({ min: 3 }),
    //     check('email').isEmail(),
    //     check('tel').isNumeric(),
    //     check('message').isLength({ min: 3 }),
    //     check('url').isURL(),

    // Create a Tutorial
    const contact = new Contact({
        name: req.body.name,
        email: req.body.email,
        tel: req.body.tel,
        message: req.body.message,
        url: req.body.url,
        // published: req.body.published ? req.body.published : false
    });

    // Save Tutorial in the database
    contact
        .save(contact)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Tutorial."
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
//
// exports.findOne = (req, res) => {
//     const id = req.params.id;
//
//     Contact.findById(id)
//         .then(data => {
//             if (!data)
//                 res.status(404).send({ message: "Not found Tutorial with id " + id });
//             else res.send(data);
//         })
//         .catch(err => {
//             res
//                 .status(500)
//                 .send({ message: "Error retrieving Tutorial with id=" + id });
//         });
// };
//
// exports.update = (req, res) => {
//     if (!req.body) {
//         return res.status(400).send({
//             message: "Data to update can not be empty!"
//         });
//     }
//
//     const id = req.params.id;
//
//     Contact.findByIdAndUpdate(id, req.body, { useFindAndModify: false })
//         .then(data => {
//             if (!data) {
//                 res.status(404).send({
//                     message: `Cannot update Tutorial with id=${id}. Maybe Tutorial was not found!`
//                 });
//             } else res.send({ message: "Tutorial was updated successfully." });
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Error updating Tutorial with id=" + id
//             });
//         });
// };
//
//
// exports.delete = (req, res) => {
//     const id = req.params.id;
//
//     Contact.findByIdAndRemove(id)
//         .then(data => {
//             if (!data) {
//                 res.status(404).send({
//                     message: `Cannot delete Tutorial with id=${id}. Maybe Tutorial was not found!`
//                 });
//             } else {
//                 res.send({
//                     message: "Tutorial was deleted successfully!"
//                 });
//             }
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message: "Could not delete Tutorial with id=" + id
//             });
//         });
// };
//
//
// exports.findAllPublished = (req, res) => {
//     Contact.find({ published: true })
//         .then(data => {
//             res.send(data);
//         })
//         .catch(err => {
//             res.status(500).send({
//                 message:
//                     err.message || "Some error occurred while retrieving tutorials."
//             });
//         });
// };

module.exports = exports;


