// import { Console } from 'console';
import { Redis } from "ioredis";
require("dotenv").config();

const redisClient = () => {
  if (process.env.REDIS_URL) {
    console.log(`Redis Connected`);
    return process.env.REDIS_URL;
  }

  throw new Error("Redis connection failed");
};

export const redis = new Redis(redisClient());



// import { Redis } from "ioredis";
// require("dotenv").config();

// let redisConnected = false; // Track connection state

// const redisClient = () => {
//   if (process.env.REDIS_URL) {
//     console.log("Connecting to Redis...");

//     // Initialize Redis with connection string and options
//     return new Redis(process.env.REDIS_URL, {
//       maxRetriesPerRequest: 20,
//       reconnectOnError: (err) => {
//         console.error("Redis connection error:", err);
//         return true; // Automatically reconnect on error
//       },
//       retryStrategy: (times) => {
//         const delay = Math.min(times * 50, 2000);
//         return delay;
//       },
//     });
//   }

//   throw new Error("Redis connection failed: REDIS_URL is not defined in environment variables.");
// };

// export const redis = redisClient();

// // Add Event Listeners
// redis.on("connect", () => {
//   if (!redisConnected) {
//     console.log("Redis connected successfully.");
//     redisConnected = true; // Set flag to true after successful connection
//   }
// });

// redis.on("error", (err) => {
//   console.error("Redis connection error:", err);
//   redisConnected = false; // Reset flag on connection error
// });

// redis.on("end", () => {
//   console.warn("Redis connection closed.");
//   redisConnected = false; // Reset flag on connection close
// });

 