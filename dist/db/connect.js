"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = exports.db = void 0;
const dotenv = __importStar(require("dotenv"));
const kysely_1 = require("kysely");
const kysely_2 = require("kysely");
const pg_1 = require("pg");
function createPool() {
    dotenv.config();
    const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } = process.env;
    try {
        if (!POSTGRES_PORT || isNaN(parseInt(POSTGRES_PORT))) {
            throw new Error("POSTGRES_PORT invalid");
        }
        const db = new kysely_1.Kysely({
            dialect: new kysely_1.PostgresDialect({
                pool: new pg_1.Pool({
                    host: POSTGRES_HOST,
                    port: parseInt(POSTGRES_PORT, 10),
                    database: POSTGRES_DB,
                    user: POSTGRES_USER,
                    password: POSTGRES_PASSWORD
                })
            })
        });
        return db;
    }
    catch (error) {
        throw error;
    }
}
exports.db = createPool();
async function connect() {
    try {
        await (0, kysely_2.sql) `SELECT 1+1;`.execute(exports.db);
        console.log("Connected to Postgres!");
        return exports.db;
    }
    catch (error) {
        throw error;
    }
}
exports.connect = connect;
