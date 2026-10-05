const express = require('express');
const { body } = require('express-validator');
const { authJwt, rateLimits, validateRequest } = require('../middlewares');
const authController = require('../controllers/auth.controller');

const router = express.Router();

function emailValidation() {
    return body('email')
        .isEmail()
        .withMessage('A valid email is required')
        .bail()
        .normalizeEmail()
        .isLength({ max: 254 });
}

router.post(
    '/signup',
    authJwt.verifyToken,
    authJwt.isAdmin,
    body('first_name').trim().isLength({ min: 3, max: 100 }),
    body('family_name').trim().isLength({ min: 3, max: 100 }),
    emailValidation(),
    body('tel').trim().isLength({ min: 5, max: 30 }).matches(/^[0-9+() .-]+$/),
    body('facebook').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).isURL({ require_protocol: true }),
    body('password')
        .isLength({ min: 12, max: 128 })
        .isStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })
        .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
        .withMessage('Password must not exceed 72 UTF-8 bytes'),
    body('date_of_birth').optional({ checkFalsy: true }).isISO8601({ strict: true }).toDate(),
    body('roles')
        .optional()
        .isArray({ min: 1, max: 2 })
        .custom(roles => new Set(roles).size === roles.length)
        .withMessage('Roles must be unique'),
    body('roles.*').optional().isIn(['user', 'admin']),
    validateRequest,
    authController.signup
);

router.post(
    '/signin',
    rateLimits.login,
    emailValidation(),
    body('password')
        .isString()
        .isLength({ min: 1, max: 128 })
        .custom(value => Buffer.byteLength(value, 'utf8') <= 72)
        .withMessage('Password must not exceed 72 UTF-8 bytes'),
    validateRequest,
    authController.signin
);

router.delete(
    '/delete',
    authJwt.verifyToken,
    authJwt.isAdmin,
    emailValidation(),
    validateRequest,
    authController.delete
);

module.exports = router;
