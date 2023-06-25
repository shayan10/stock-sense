"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PlaidService_1 = __importDefault(require("../services/plaid/PlaidService"));
const router = (0, express_1.Router)();
router.get('/link-token', async (req, res) => {
    try {
        const { user_id } = req.body;
        const linkToken = await PlaidService_1.default.generateLinkToken(user_id);
        res.status(200).send(linkToken);
    }
    catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});
exports.default = router;
