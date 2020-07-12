var express = require('express');
var router = express.Router();
// var fs = require("fs");
const { authJwt } = require("../middlewares");
const Contact = require("../controllers/contact.controller");
const { check, validationResult } = require('express-validator');

    // Create a new Tutorial
//   tel: { type: String, required: true, maxlength: 100},
//         email: { type: String, required: true, maxlength: 100},
//         name: { type: String, required: true, maxlength: 100},
//         message: { type: String, required: true, maxlength: 1000},
//         url: { type: String, maxlength: 100},
router.post("/", [
    check('name').isLength({ min: 3 }),
    check('email').isEmail(),
    check('tel').isNumeric(),
    check('message').isLength({ min: 3 }),
    check('url').isURL(),
],
    Contact.create);

// Retrieve all Tutorials
router.get(
    "/",
    [authJwt.verifyToken, authJwt.isAdmin],
    Contact.findAll
);
//
// // Retrieve all published Tutorials
// router.get("/published", tutorials.findAllPublished);
//
// // Retrieve a single Tutorial with id
// router.get("/:id", tutorials.findOne);
//
// // Update a Tutorial with id
// router.put("/:id", tutorials.update);
//
// // Delete a Tutorial with id
// router.delete("/:id", tutorials.delete);

// Create a new Tutorial
// router.delete("/", tutorials.deleteAll);

// app.use('/api/tutorials', router);
// };


module.exports = router;
