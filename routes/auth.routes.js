const express = require('express');
const router = express.Router();
const { verifySignUp } = require("../middlewares");
const { authJwt } = require("../middlewares");
const { check } = require('express-validator');

const authController = require("../controllers/auth.controller");

router.post(
    "/signup",
    [
        authJwt.verifyToken,
        authJwt.isAdmin,
        verifySignUp.checkDuplicateEmail,
        verifySignUp.checkRolesExists,
        check('first_name').isLength({ min: 3 }),
        check('family_name').isLength({ min: 3 }),
        check('email').isEmail(),
        check('tel').isNumeric(),
        check('facebook').isURL(),
        check("password", "Password should be complex enough.").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i"),
        check('date_of_birth').isISO8601(),
    ],
    authController.signup
);

router.post("/signin", authController.signin);

router.delete(
    "/delete",
    [
        authJwt.verifyToken,
        authJwt.isAdmin,
    ],
    authController.delete
);

module.exports = router;