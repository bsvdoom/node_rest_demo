const express = require('express');
const { body } = require('express-validator');
const { authJwt, rateLimits, validateRequest } = require('../middlewares');
const contactController = require('../controllers/contact.controller');

const router = express.Router();

router.post(
    '/',
    rateLimits.contact,
    body('name').trim().isLength({ min: 3, max: 100 }),
    body('email').isEmail().bail().normalizeEmail().isLength({ max: 254 }),
    body('tel').trim().isLength({ min: 5, max: 30 }).matches(/^[0-9+() .-]+$/),
    body('message').trim().isLength({ min: 3, max: 1000 }),
    body('url').optional({ checkFalsy: true }).trim().isLength({ max: 200 }).isURL({ require_protocol: true }),
    validateRequest,
    contactController.create
);

router.get('/', authJwt.verifyToken, authJwt.isAdmin, contactController.findAll);

module.exports = router;
