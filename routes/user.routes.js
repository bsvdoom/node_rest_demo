const express = require('express');
const router = express.Router();
const { authJwt } = require("../middlewares");
const userController = require("../controllers/user.controller");

// module.exports = function(app) {
// app.use(function(req, res, next) {
//     res.header(
//         "Access-Control-Allow-Headers",
//         "x-access-token, Origin, Content-Type, Accept"
//     );
//     next();
// });

router.get("/all", userController.allAccess);

router.get("/user", [authJwt.verifyToken], userController.userBoard);

router.get(
    "/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    userController.adminBoard
);
// };
module.exports = router;