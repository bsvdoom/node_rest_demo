const config = require("../config/auth.config");
const { validationResult } = require('express-validator');

const User = require('../models/user.model');
const Role = require('../models/role.model');

let jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() })
    }

    const user = new User({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        email: req.body.email,
        tel: req.body.tel,
        facebook: req.body.facebook,
        password: bcrypt.hashSync(req.body.password, 8),
        date_of_birth: req.body.date_of_birth,
        active: true,
    });

    user.save((err, user) => {
        if (err) {
            res.status(500).send({ message: err });
            return;
        }

        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                },
                (err, roles) => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    user.roles = roles.map(role => role._id);
                    user.save(err => {
                        if (err) {
                            res.status(500).send({ message: err });
                            return;
                        }

                        res.send({ message: "User was registered successfully!" });
                    });
                }
            );
        } else {
            Role.findOne({ name: "user" }, (err, role) => {
                if (err) {
                    res.status(500).send({ message: err });
                    return;
                }

                user.roles = [role._id];
                user.save(err => {
                    if (err) {
                        res.status(500).send({ message: err });
                        return;
                    }

                    res.send({ message: "User was registered successfully!" });
                });
            });
        }
    });
};

exports.signin = (req, res) => {
    User.findOne({
        email: req.body.email
    })
        .populate("roles", "-__v")
        .exec((err, user) => {
            if (err) {
                res.status(500).send({ message: err });
                return;
            }

            if (!user) {
                return res.status(404).send({ message: "Wrong email or password." });
            }

            let passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
            );

            if (!passwordIsValid) {
                return res.status(401).send({
                    accessToken: null,
                    message: "Invalid Password!"
                });
            }

            let token = jwt.sign({ id: user.id }, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            let authorities = [];

            for (let i = 0; i < user.roles.length; i++) {
                authorities.push(user.roles[i].name);
            }
            res.status(200).send({
                id: user._id,
                first_name: user.first_name,
                family_name: user.family_name,
                email: user.email,
                tel: user.tel,
                facebook: user.facebook,
                date_of_birth: user.date_of_birth,
                roles: authorities,
                accessToken: token
            });
        });
};

exports.delete = (req, res) => {
    const email = req.body.email;

    User.findOneAndDelete(
        { "email" : email }
    ).then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot delete User with id=${email}, User not found.`
                });
            } else {
                res.send({
                    message: "User was deleted successfully!"
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Could not delete User with id=" + email
            });
        });
};