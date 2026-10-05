const { validationResult } = require('express-validator');

module.exports = function validateRequest(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) {
        return next();
    }

    const error = new Error('Validation failed');
    error.status = 422;
    error.details = result.array({ onlyFirstError: true });
    return next(error);
};
