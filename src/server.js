"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const auth_1 = require("./auth");
const config_1 = require("./config");
const database_1 = require("./database");
const app = express_1.default();
const { PORT = 3003 } = process.env;
app.use(express_1.default.json());
app.use(cors_1.default());
database_1.seedUserStore();
function checkAuthMiddleware(request, response, next) {
    const { authorization } = request.headers;
    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    const [, token] = authorization === null || authorization === void 0 ? void 0 : authorization.split(' ');
    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.auth.secret);
        request.user = decoded.sub;
        return next();
    }
    catch (err) {
        return response
            .status(401)
            .json({ error: true, code: 'token.expired', message: 'Token invalid.' });
    }
}
function addUserInformationToRequest(request, response, next) {
    const { authorization } = request.headers;
    if (!authorization) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    const [, token] = authorization === null || authorization === void 0 ? void 0 : authorization.split(' ');
    if (!token) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Token not present.' });
    }
    try {
        const decoded = jwt_decode_1.default(token);
        request.user = decoded.sub;
        return next();
    }
    catch (err) {
        return response
            .status(401)
            .json({ error: true, code: 'token.invalid', message: 'Invalid token format.' });
    }
}
app.post('/sessions', (request, response) => {
    const { email, password } = request.body;
    const user = database_1.users.get(email);
    if (!user || password !== user.password) {
        return response
            .status(401)
            .json({
            error: true,
            message: 'E-mail or password incorrect.'
        });
    }
    const { token, refreshToken } = auth_1.generateJwtAndRefreshToken(email, {
        permissions: user.permissions,
        roles: user.roles,
    });
    return response.json({
        token,
        refreshToken,
        permissions: user.permissions,
        roles: user.roles,
    });
});
app.post('/refresh', addUserInformationToRequest, (request, response) => {
    const email = request.user;
    const { refreshToken } = request.body;
    const user = database_1.users.get(email);
    if (!user) {
        return response
            .status(401)
            .json({
            error: true,
            message: 'User not found.'
        });
    }
    if (!refreshToken) {
        return response
            .status(401)
            .json({ error: true, message: 'Refresh token is required.' });
    }
    const isValidRefreshToken = database_1.checkRefreshTokenIsValid(email, refreshToken);
    if (!isValidRefreshToken) {
        return response
            .status(401)
            .json({ error: true, message: 'Refresh token is invalid.' });
    }
    database_1.invalidateRefreshToken(email, refreshToken);
    const { token, refreshToken: newRefreshToken } = auth_1.generateJwtAndRefreshToken(email, {
        permissions: user.permissions,
        roles: user.roles,
    });
    return response.json({
        token,
        refreshToken: newRefreshToken,
        permissions: user.permissions,
        roles: user.roles,
    });
});
app.get('/me', checkAuthMiddleware, (request, response) => {
    const email = request.user;
    const user = database_1.users.get(email);
    if (!user) {
        return response
            .status(400)
            .json({ error: true, message: 'User not found.' });
    }
    return response.json({
        email,
        permissions: user.permissions,
        roles: user.roles,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
