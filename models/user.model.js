const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        first_name: { type: String, required: true, maxlength: 100},
        family_name: { type: String, required: true, maxlength: 100},
        email: { type: String, required: true, maxlength: 100},
        tel: { type: String, required: true, maxlength: 100},
        facebook: { type: String, maxlength: 100},
        password: { type: String, required: true, maxlength: 100},
        date_of_birth: Date,
        active: Boolean,
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ]
    })
);

module.exports = User;