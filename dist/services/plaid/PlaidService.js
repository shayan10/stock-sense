"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const plaid_1 = require("plaid");
const plaidClient_1 = __importDefault(require("./plaidClient"));
class PlaidService {
    constructor(plaidAPI) {
        this.plaidAPI = plaidAPI;
    }
    async generateLinkToken(user_id, access_token) {
        const request = {
            user: {
                client_user_id: user_id,
            },
            client_name: 'Plaid Test App',
            products: [plaid_1.Products.Auth, plaid_1.Products.Investments, plaid_1.Products.InvestmentsAuth],
            country_codes: [plaid_1.CountryCode.Us],
            language: 'en',
            // webhook: 'https://sample-web-hook.com',
            account_filters: {
                investment: {
                    account_subtypes: []
                }
            }
        };
        if (access_token) {
            request["access_token"] = access_token;
        }
        const response = await this.plaidAPI.linkTokenCreate(request);
        if (response.status != 200) {
            throw new Error("Failed to generated link");
        }
        return response.data.link_token;
    }
}
const plaidClient = (0, plaidClient_1.default)();
const plaidService = new PlaidService(plaidClient);
exports.default = plaidService;
