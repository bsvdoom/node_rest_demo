const mongoose = require("mongoose");

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        first_name: { type: String, required: true, trim: true, maxlength: 100 },
        family_name: { type: String, required: true, trim: true, maxlength: 100 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
        tel: { type: String, required: true, trim: true, maxlength: 30 },
        facebook: { type: String, trim: true, maxlength: 200 },
        password: { type: String, required: true, select: false },
        date_of_birth: Date,
        active: { type: Boolean, default: true },
        roles: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Role"
            }
        ]
    }, { timestamps: true })
);

module.exports = User;
