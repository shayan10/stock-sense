"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../services/users/User");
const utiils_1 = require("../utiils");
const UserSchema_1 = require("../services/users/UserSchema");
const UserSchema_2 = require("../services/users/UserSchema");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    const { body } = req;
    try {
        const sanitizedInput = await (0, utiils_1.validate)(UserSchema_2.userSchema, body);
        const user = await User_1.User.insert(sanitizedInput);
        res.send(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).send(error.flatten().fieldErrors);
        }
    }
});
router.get('/', async (req, res) => {
    try {
        const { user_id } = req.body;
        const user = User_1.User.get(user_id);
        res.send(user);
    }
    catch (error) {
        if (error instanceof User_1.UserNotFound) {
            res.status(404).send({ error: "User not found" });
        }
        else {
            res.status(400).send(error);
        }
    }
});
router.patch('/', async (req, res) => {
    const { body } = req;
    try {
        const sanitizedInput = await (0, utiils_1.validate)(UserSchema_1.userUpdateSchema, body);
        const user = await User_1.User.update(1, sanitizedInput);
        if (!user) {
            return res.status(404).send({ error: "User not found" });
        }
        res.status(200).send(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).send(error.flatten().fieldErrors);
        }
    }
});
exports.default = router;
