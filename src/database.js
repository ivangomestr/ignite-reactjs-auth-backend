"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateRefreshToken = exports.checkRefreshTokenIsValid = exports.createRefreshToken = exports.seedUserStore = exports.tokens = exports.users = void 0;
const uuid_1 = require("uuid");
exports.users = new Map();
exports.tokens = new Map();
function seedUserStore() {
    exports.users.set('diego@rocketseat.team', {
        password: '123456',
        permissions: ['users.list', 'users.create', 'metrics.list'],
        roles: ['administrator']
    });
    exports.users.set('estagiario@rocketseat.team', {
        password: '123456',
        permissions: ['users.list', 'metrics.list'],
        roles: ['editor']
    });
}
exports.seedUserStore = seedUserStore;
function createRefreshToken(email) {
    var _a;
    const currentUserTokens = (_a = exports.tokens.get(email)) !== null && _a !== void 0 ? _a : [];
    const refreshToken = uuid_1.v4();
    exports.tokens.set(email, [...currentUserTokens, refreshToken]);
    return refreshToken;
}
exports.createRefreshToken = createRefreshToken;
function checkRefreshTokenIsValid(email, refreshToken) {
    var _a;
    const storedRefreshTokens = (_a = exports.tokens.get(email)) !== null && _a !== void 0 ? _a : [];
    return storedRefreshTokens.some(token => token === refreshToken);
}
exports.checkRefreshTokenIsValid = checkRefreshTokenIsValid;
function invalidateRefreshToken(email, refreshToken) {
    var _a;
    const storedRefreshTokens = (_a = exports.tokens.get(email)) !== null && _a !== void 0 ? _a : [];
    exports.tokens.set(email, storedRefreshTokens.filter(token => token !== refreshToken));
}
exports.invalidateRefreshToken = invalidateRefreshToken;
