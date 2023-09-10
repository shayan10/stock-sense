import {Redis} from "ioredis";

export const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379
});

export const redisConnect = (): Promise<any> => {  
    return new Promise<void>((resolve, reject) => {
      redisClient.on('error', (error) => {
        console.log("Error! Redis conenction failed.")
        reject(error);
      });
      redisClient.on("ready", () => {
        console.log("Connected to redis!");
        resolve()
      })
    });
};