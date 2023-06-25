"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plaid_1 = require("plaid");
const initializePlaidClient = () => {
    const { PLAID_CLIENT_ID, PLAID_CLIENT_SECRET } = process.env;
    if (!PLAID_CLIENT_ID || !PLAID_CLIENT_SECRET) {
        throw new Error("Plaid Credentials undefined");
    }
    const configuration = new plaid_1.Configuration({
        basePath: plaid_1.PlaidEnvironments.sandbox,
        baseOptions: {
            headers: {
                'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
                'PLAID-SECRET': PLAID_CLIENT_SECRET,
            },
        },
    });
    const client = new plaid_1.PlaidApi(configuration);
    return client;
};
exports.default = initializePlaidClient;
