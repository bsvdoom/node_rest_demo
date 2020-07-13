const mongoose = require("mongoose");
const Contact = mongoose.model(
    "Contact",
    new mongoose.Schema({
        name: { type: String, required: true, maxlength: 100},
        email: { type: String, required: true, maxlength: 100},
        tel: { type: String, required: true, maxlength: 100},
        message: { type: String, required: true, maxlength: 1000},
        url: { type: String, maxlength: 100},
    },
    { timestamps: true }
)
);
module.exports = Contact;