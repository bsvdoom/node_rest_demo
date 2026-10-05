const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const contactRouter = require('./routes/contact.routes');
const authRouter = require('./routes/auth.routes');
const requireEnv = require('./config/env');
const { mongoose } = require('./models');

const app = express();
const allowedOrigins = requireEnv('CORS_ORIGIN')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        const error = new Error('Origin is not allowed by CORS');
        error.status = 403;
        return callback(error);
    },
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
};

app.disable('x-powered-by');
app.use(helmet());
app.use(cors(corsOptions));
app.use(logger(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));

app.get('/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1;
    return res.status(databaseConnected ? 200 : 503).json({
        status: databaseConnected ? 'ok' : 'unavailable'
    });
});

app.use('/', contactRouter);
app.use('/auth', authRouter);

app.use((req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    return next(error);
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    let status = Number.isInteger(err.status) ? err.status : 500;
    let message = status >= 500 ? 'Internal server error' : err.message;

    if (err.code === 11000) {
        status = 409;
        message = 'A user with this email already exists';
    } else if (err.type === 'entity.parse.failed') {
        status = 400;
        message = 'Invalid JSON request body';
    } else if (err.type === 'entity.too.large') {
        status = 413;
        message = 'Request body is too large';
    } else if (err.name === 'ValidationError') {
        status = 422;
        message = 'Validation failed';
    }

    if (status >= 500) {
        console.error(err);
    }

    const body = { message };
    if (err.details) {
        body.errors = err.details;
    }

    return res.status(status).json(body);
});

module.exports = app;
