"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnect = exports.redisClient = void 0;
const ioredis_1 = require("ioredis");
exports.redisClient = new ioredis_1.Redis({
    host: "127.0.0.1",
    port: 6379
});
const redisConnect = () => {
    return new Promise((resolve, reject) => {
        exports.redisClient.on('error', (error) => {
            console.log("Error! Redis conenction failed.");
            reject(error);
        });
        exports.redisClient.on("ready", () => {
            console.log("Connected to redis!");
            resolve();
        });
    });
};
exports.redisConnect = redisConnect;
