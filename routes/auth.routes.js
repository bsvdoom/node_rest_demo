let express = require('express');
let router = express.Router();
const { verifySignUp } = require("../middlewares");
const authController = require("../controllers/auth.controller");
const { check, validationResult } = require('express-validator');


// module.exports = function(app) {
//     app.use(function(req, res, next) {
//         res.header(
//             "Access-Control-Allow-Headers",
//             "x-access-token, Origin, Content-Type, Accept"
//         );
//         next();
//     }); first_name: req.body.username,
//         family_name: req.body.username,
//         email: req.body.username,
//         tel: req.body.username,
//         facebook: req.body.email,
//         password: bcrypt.hashSync(req.body.password, 8),
//         date_of_birth: req.body.email,
//         active: true,

router.post(
    "/signup",
    [
        verifySignUp.checkDuplicateEmail,
        verifySignUp.checkRolesExisted,
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
// };

module.exports = router;