const express = require('express');
const router = express.Router();
const { authJwt } = require("../middlewares");
const Contact = require("../controllers/contact.controller");
const { check } = require('express-validator');

router.post("/", [
    check('name').isLength({ min: 3 }),
    check('email').isEmail(),
    check('tel').isNumeric(),
    check('message').isLength({ min: 3 }),
    check('url').isURL(),
],
    Contact.create
);

router.get(
    "/",
    [authJwt.verifyToken, authJwt.isAdmin],
    Contact.findAll
);

module.exports = router;
