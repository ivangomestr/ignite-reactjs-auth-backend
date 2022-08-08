"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateJwtAndRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const database_1 = require("./database");
function generateJwtAndRefreshToken(email, payload = {}) {
    const token = jsonwebtoken_1.default.sign(payload, config_1.auth.secret, {
        subject: email,
        expiresIn: 5, // 15 minutes
    });
    const refreshToken = database_1.createRefreshToken(email);
    return {
        token,
        refreshToken,
    };
}
exports.generateJwtAndRefreshToken = generateJwtAndRefreshToken;
