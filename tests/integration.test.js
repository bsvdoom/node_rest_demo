const fs = require('fs');
const { describe, test } = require('node:test');
const assert = require('node:assert/strict');

const baseUrl = `http://127.0.0.1:${process.env.PORT || 3000}`;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = fs
    .readFileSync(process.env.ADMIN_PASSWORD_FILE, 'utf8')
    .replace(/[\r\n]+$/, '');
const userEmail = 'user@integration.test';
const userPassword = 'Integration123!';

let adminToken;
let userToken;
let contactId;

async function request(path, { token, body, ...options } = {}) {
    const headers = { ...options.headers };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    return {
        status: response.status,
        body: text ? JSON.parse(text) : null
    };
}

describe('REST API integration', { concurrency: false }, () => {
    test('health reports a connected application', async () => {
        const response = await request('/health');
        assert.equal(response.status, 200);
        assert.deepEqual(response.body, { status: 'ok' });
    });

    test('invalid login returns the generic response', async () => {
        const response = await request('/auth/signin', {
            method: 'POST',
            body: { email: adminEmail, password: 'WrongPassword123!' }
        });
        assert.equal(response.status, 401);
        assert.equal(response.body.message, 'Invalid email or password');
    });

    test('admin can log in', async () => {
        const response = await request('/auth/signin', {
            method: 'POST',
            body: { email: adminEmail, password: adminPassword }
        });
        assert.equal(response.status, 200);
        assert.ok(response.body.accessToken);
        assert.ok(response.body.roles.includes('admin'));
        adminToken = response.body.accessToken;
    });

    test('contact list rejects unauthenticated requests', async () => {
        const response = await request('/');
        assert.equal(response.status, 401);
        assert.equal(response.body.message, 'Unauthorized');
    });

    test('admin can create a regular user', async () => {
        const response = await request('/auth/signup', {
            method: 'POST',
            token: adminToken,
            body: {
                first_name: 'Integration',
                family_name: 'User',
                email: userEmail,
                tel: '+3620000000',
                password: userPassword,
                roles: ['user']
            }
        });
        assert.equal(response.status, 201);
    });

    test('regular user is denied by admin protection', async () => {
        const login = await request('/auth/signin', {
            method: 'POST',
            body: { email: userEmail, password: userPassword }
        });
        assert.equal(login.status, 200);
        userToken = login.body.accessToken;

        const response = await request('/', { token: userToken });
        assert.equal(response.status, 403);
        assert.equal(response.body.message, 'Admin role required');
    });

    test('contact validation rejects invalid input', async () => {
        const response = await request('/', {
            method: 'POST',
            body: { name: 'x', email: 'invalid', tel: 'x', message: '' }
        });
        assert.equal(response.status, 422);
        assert.equal(response.body.message, 'Validation failed');
        assert.ok(response.body.errors.length >= 1);
    });

    test('contact can be created with JSON mail transport', async () => {
        const response = await request('/', {
            method: 'POST',
            body: {
                name: 'Integration Contact',
                email: 'contact@integration.test',
                tel: '+3630000000',
                message: 'Integration test message',
                url: 'https://example.test/contact'
            }
        });
        assert.equal(response.status, 201);
        assert.ok(response.body._id);
        contactId = response.body._id;
    });

    test('admin can list the created contact', async () => {
        const response = await request('/', { token: adminToken });
        assert.equal(response.status, 200);
        assert.ok(response.body.some(contact => contact._id === contactId));
    });

    test('admin can delete the user and deleted login fails', async () => {
        const deletion = await request('/auth/delete', {
            method: 'DELETE',
            token: adminToken,
            body: { email: userEmail }
        });
        assert.equal(deletion.status, 200);

        const login = await request('/auth/signin', {
            method: 'POST',
            body: { email: userEmail, password: userPassword }
        });
        assert.equal(login.status, 401);
        assert.equal(login.body.message, 'Invalid email or password');
    });
});
