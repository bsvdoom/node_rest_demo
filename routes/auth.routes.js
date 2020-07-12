var express = require('express');
var router = express.Router();
const { verifySignUp } = require("../middlewares");
const authController = require("../controllers/auth.controller");
// module.exports = function(app) {
//     app.use(function(req, res, next) {
//         res.header(
//             "Access-Control-Allow-Headers",
//             "x-access-token, Origin, Content-Type, Accept"
//         );
//         next();
//     });

router.post(
    "/signup",
    [
        verifySignUp.checkDuplicateUsernameOrEmail,
        verifySignUp.checkRolesExisted
    ],
    authController.signup
);

router.post("/signin", authController.signin);
// };

module.exports = router;