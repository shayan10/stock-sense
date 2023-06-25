"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const authRouter_1 = __importDefault(require("./routes/authRouter"));
const plaidRouter_1 = __importDefault(require("./routes/plaidRouter"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const app = () => {
    const _app = (0, express_1.default)();
    _app.use((0, helmet_1.default)());
    _app.use(body_parser_1.default.json());
    _app.use(body_parser_1.default.urlencoded({ extended: true }));
    _app.use((0, cookie_parser_1.default)());
    _app.use("/auth", authRouter_1.default);
    _app.use("/users", authMiddleware_1.authMiddleware, userRouter_1.default);
    _app.use("/plaid", authMiddleware_1.authMiddleware, plaidRouter_1.default);
    return _app;
};
exports.app = app;
