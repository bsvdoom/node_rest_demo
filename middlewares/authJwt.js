const jwt = require("jsonwebtoken");
const config = require("../config/auth.config.js");

const User = require('../models/user.model');
const Role = require('../models/role.model');

verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.id;
        next();
    });
};

isAdmin = (req, res, next) => {
    User.findById(req.userId).exec((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (!user) {
            return res.status(404).send({ message: "Wrong user." });
        }

        Role.find(
            {
                _id: { $in: user.roles }
            },
            (err, roles) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }

                res.status(403).send({ message: "Require Admin Role!" });
                return;
            }
        );
    });
};

getAdminEmail = (req, res, next) => {

        Role.find(
            {
                name: "admin"
            },
            (err, role) => {
                if (err) {
                    console.log(err);
                    return;
                }
                if(!role) {
                    console.log("This should not happen.");
                }

                User.findOne(
                    {"roles" : role[0]._id}
                    ).exec((err, user) => {
                    if (err) {
                        console.log(err);
                        return;
                    }

                    if (!user) {
                        console.log("No admin user.");
                        return;
                    }

                    req.admin_email = user.email;
                    next();
            }
        );
    });
};

const authJwt = {
    verifyToken,
    isAdmin,
    getAdminEmail
};

module.exports = authJwt;