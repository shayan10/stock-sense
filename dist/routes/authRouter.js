"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../services/authentication/auth");
const TokenService_1 = require("../services/authentication/TokenService");
const zod_1 = require("zod");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    const { body } = req;
    try {
        // Validate username and password
        const { username, password } = zod_1.z.object({
            username: zod_1.z.string(),
            password: zod_1.z.string()
        }).strip().parse(body);
        const { accessToken, refreshToken } = await auth_1.authController.authenticate(username, password);
        res.cookie("refreshToken", refreshToken, {
            sameSite: true,
            httpOnly: true
        });
        res.status(200).send({ accessToken });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).send(error.flatten().fieldErrors);
        }
        else {
            console.log(error);
            res.status(400).send(error);
        }
    }
});
router.post('/refresh', async (req, res) => {
    try {
        // Check if refresh token attached
        if (!req.cookies.refreshToken)
            res.status(401).send({ message: "Forbidden" });
        console.log(req.cookies);
        // Refresh Token
        const { accessToken, refreshToken } = await auth_1.authController.refresh(req.cookies.refreshToken);
        res.status(200).send({
            accessToken, refreshToken
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).send(error.flatten().fieldErrors);
        }
        else if (error instanceof TokenService_1.TokenVerificationError) {
            res.status(401).send();
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.get("/logout", authMiddleware_1.authMiddleware, async (req, res) => {
    try {
        // Check if refresh token attached
        if (!req.cookies.refreshToken || !req.headers.authorization) {
            res.status(401).send({ message: "Forbidden" });
            return;
        }
        auth_1.authController.logout(req.headers.authorization, req.cookies.refreshToken);
        res.clearCookie("refreshToken");
        res.status(200).send();
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).send(error.flatten().fieldErrors);
        }
        else if (error instanceof TokenService_1.TokenVerificationError) {
            res.status(401).send();
        }
        else {
            res.status(400).send(error);
        }
    }
});
exports.default = router;
