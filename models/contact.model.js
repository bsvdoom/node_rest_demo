// var express = require('express');
var mongoose = require("mongoose");
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
//const User = require('../models/user.model');



// schema.method("toJSON", function() {
//     const { __v, _id, ...object } = this.toObject();
//     object.id = _id;
//     return object;
// });

// const Tutorial = mongoose.model("Tutorial", schema);
// return Tutorial;

// module.exports = mongoose.model('List', listSchema);
// module.exports = mongoose.model("tutorial", schema);

// const Tutorial = mongoose.model('tutorials',schema);

// module.exports = Tutorial;
// module.exports = mongoose.model('contacts',schema);