const mongoose = require("mongoose");
const Contact = mongoose.model(
    "Contact",
    new mongoose.Schema({
        name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
        tel: { type: String, required: true, trim: true, maxlength: 30 },
        message: { type: String, required: true, trim: true, maxlength: 1000 },
        url: { type: String, trim: true, maxlength: 200 },
    },
    { timestamps: true }
)
);
module.exports = Contact;
