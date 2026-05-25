const http = require("http");
const https = require("https");

const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
const cluster = require("cluster");
const os = require("os");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Redis = require("redis");

// const http = require("http");
// const { Server } = require("socket.io");
// const ChatService = require("./services/chatService");

// Load environment variables
dotenv.config({ path: "./config.env" });



//  const numCPUs = os.cpus().length;
const numCPUs = Math.min(require('os').cpus().length, 1);
const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// const REDIS_URL = process.env.REDISCLOUD_URL || "redis://127.0.0.1:6379";
const isProduction = process.env.NODE_ENV === 'production';
// console.log(isProduction)

const REDIS_URL = isProduction
  ? process.env.REDISCLOUD_URL
  : `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || '6379'}`;


let redisClient; // Declare Redis client globally

if (cluster.isMaster) {
    console.log(`🟢 Master process ${process.pid} is running`);


    require('./jobs/index'); 
    
    redisClient = Redis.createClient({
        url: REDIS_URL,
        // socket: isProduction ? { tls: {} } : {}, // Use TLS only in production (for Redis Cloud)
        socket: isProduction ? { tls: {}, agent: httpsAgent } : { agent: httpAgent } // Assign appropriate agent

      });

    

    redisClient.on("connect", () => console.log("✅ Master process connected to Redis!"));
    redisClient.on("error", (err) => console.error("❌ Redis Error:", err));

    redisClient.connect()
        .catch((err) => console.error("❌ Redis Connection Failed:", err));



    // cluster.on("message", async (worker, message) => {
    //     if (message.type === "redis_get") {
    //         const value = await redisClient.get(message.key);
    //         worker.send({ type: "redis_response", key: message.key, value });
    //     } else if (message.type === "redis_set") {
    //         const ttl = parseInt(message.ttl, 10);
    //         if (!isNaN(ttl) && ttl > 0) {
    //             await redisClient.set(message.key, message.value, { EX: ttl });
    //         }
    //     } else if (message.type === "redis_setEx") {
    //         await redisClient.setEx(message.key, message.ttl, message.value);
    //     } else if (message.type === "redis_set_with_options") {
    //         await redisClient.set(message.key, message.value, message.options);
    //     }
    // });
      
    cluster.on("message", async (worker, message) => {
        if (message.type === "redis_get") {
          const value = await redisClient.get(message.key);
          worker.send({ type: "redis_response", key: message.key, value });
        } else if (message.type === "redis_set") {
          const ttl = parseInt(message.ttl, 10);
          if (!isNaN(ttl) && ttl > 0) {
            await redisClient.set(message.key, message.value, { EX: ttl });
          }
        } else if (message.type === "redis_setEx") {
          await redisClient.setEx(message.key, message.ttl, message.value);
        } else if (message.type === "redis_set_with_options") {
          await redisClient.set(message.key, message.value, message.options);
        }
      
        // ✅ ADD THIS 👇
        else if (message.type === "redis_del") {
          try {
            await redisClient.del(message.key);
            console.log(`🧹 Deleted Redis key: ${message.key}`);
      
            // Optional: send confirmation back
            worker.send({
              type: "redis_del_response",
              key: message.key,
              success: true,
            });
          } catch (err) {
            console.error(`❌ Failed to delete Redis key: ${message.key}`, err);
            worker.send({
              type: "redis_del_response",
              key: message.key,
              success: false,
            });
          }
        }
      });
      

    // Fork workers based on CPU cores
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    // Restart worker if it crashes
    cluster.on("exit", (worker, code, signal) => {
        console.log(`🔴 Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });

    // Handle graceful shutdown
    process.on("SIGTERM", () => {
        console.log("👋 SIGTERM RECEIVED. Closing master process gracefully...");
        mongoose.connection.close(false, () => {
            console.log("💥 MongoDB connection closed.");
            redisClient.quit(() => {
                console.log("🔌 Redis connection closed.");
                process.exit(0);
            });
        });
    });

} else {
    //Initialize MongoDB in Workers
    mongoose
        .connect(DB, {
            serverSelectionTimeoutMS: 5000,
            readConcern: { level: "majority" },
            writeConcern: { w: "majority" },
        })
        .then(() => console.log(`🔗 Worker ${process.pid} connected to MongoDB!`))
        .catch((err) => {
            console.error(`❌ Worker ${process.pid} failed to connect to MongoDB:`, err);
            process.exit(1);
        });



    const redisWorkerClient = {
        // get: (key) => {
        //     return new Promise((resolve) => {
        //         process.send({ type: "redis_get", key });
        //         process.on("message", (message) => {
        //             if (message.type === "redis_response" && message.key === key) {
        //                 resolve(message.value);
        //             }
        //         });
        //     });
        // },
        get: (key) => {
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              process.removeListener("message", handler);
              reject(new Error(`Timeout waiting for redis_response for key: ${key}`));
            }, 5000); // ⏱️ 5 sec timeout fallback
        
            const handler = (message) => {
              if (message.type === "redis_response" && message.key === key) {
                clearTimeout(timeout);
                process.removeListener("message", handler);
                resolve(message.value);
              }
            };
        
            process.on("message", handler);
            process.send({ type: "redis_get", key });
          });
        },
        set: (key, value, ttl = 3600) => {
            process.send({ type: "redis_set", key, value, ttl });
        },
        setEx: (key, ttl, value) => {
            process.send({ type: "redis_setEx", key, value, ttl });
        },
        setWithOptions: (key, value, options = {}) => {
            process.send({ type: "redis_set_with_options", key, value, options });
        },
        del: (key) => {
            process.send({ type: "redis_del", key });
        }
    };
    

    // Store Redis Worker Client Globally
    global.redisClient = redisWorkerClient;

    

    // Load Express App inside Worker
    const app = require("./app");

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
        console.log(`🚀 Worker ${process.pid} running on port ${port}...`);
    });

    // Error Handling in Workers
    process.on("uncaughtException", (err) => {
        console.error(`💥 Worker ${process.pid} UNCAUGHT EXCEPTION!`, err);
        process.exit(1);
    });

    process.on("unhandledRejection", (err) => {
        console.error(`⚠️ Worker ${process.pid} UNHANDLED REJECTION!`, err);
        server.close(() => process.exit(1));
    });

    // Worker shutdown handling
    process.on("SIGTERM", () => {
        console.log(`👋 Worker ${process.pid} shutting down...`);
        server.close();
    });
}


// const cluster = require("cluster");
// const os = require("os");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const Redis = require("redis");
// const http = require("http");
// const { Server } = require("socket.io");
// const ChatService = require("./services/chatService");

// // Load environment variables
// dotenv.config({ path: "./config.env" });

// const numCPUs = Math.min(os.cpus().length, 4);
// const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
// const isProduction = process.env.NODE_ENV === "production";
// const REDIS_URL = isProduction
//   ? process.env.REDISCLOUD_URL
//   : `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || "6379"}`;

// let redisClient;

// if (cluster.isMaster) {
//   console.log(`🟢 Master process ${process.pid} is running`);

//   redisClient = Redis.createClient({
//     url: REDIS_URL,
//     socket: isProduction ? { tls: {} } : {}, // Use TLS only in production (for Redis Cloud)
//   });

//   redisClient.on("connect", () => console.log("✅ Master process connected to Redis!"));
//   redisClient.on("error", (err) => console.error("❌ Redis Error:", err));
//   redisClient.connect().catch((err) => console.error("❌ Redis Connection Failed:", err));

//   cluster.on("message", async (worker, message) => {
//     if (message.type === "redis_get") {
//       const value = await redisClient.get(message.key);
//       worker.send({ type: "redis_response", key: message.key, value });
//     } else if (message.type === "redis_set") {
//       await redisClient.set(message.key, message.value, { EX: parseInt(message.ttl, 10) || 3600 });
//     }
//   });

//   // Fork workers
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on("exit", (worker) => {
//     console.log(`🔴 Worker ${worker.process.pid} died. Restarting...`);
//     cluster.fork();
//   });

//   process.on("SIGTERM", () => {
//     console.log("👋 SIGTERM RECEIVED. Closing master process...");
//     mongoose.connection.close(false, () => {
//       console.log("💥 MongoDB connection closed.");
//       redisClient.quit(() => {
//         console.log("🔌 Redis connection closed.");
//         process.exit(0);
//       });
//     });
//   });
// } else {
//   // ✅ Initialize MongoDB in Workers
//   mongoose
//     .connect(DB, { serverSelectionTimeoutMS: 5000, readConcern: { level: "majority" } })
//     .then(() => console.log(`🔗 Worker ${process.pid} connected to MongoDB!`))
//     .catch((err) => {
//       console.error(`❌ Worker ${process.pid} failed to connect to MongoDB:`, err);
//       process.exit(1);
//     });

//   // ✅ Setup Redis Worker Client
//   const redisWorkerClient = {
//     get: (key) =>
//       new Promise((resolve) => {
//         process.send({ type: "redis_get", key });
//         process.on("message", (message) => {
//           if (message.type === "redis_response" && message.key === key) resolve(message.value);
//         });
//       }),
//     set: (key, value, ttl = 3600) => process.send({ type: "redis_set", key, value, ttl }),
//   };

//   global.redisClient = redisWorkerClient;

//   // ✅ Setup HTTP & Socket.io Server
//   const app = require("./app");
//   const server = http.createServer(app);
//   const io = new Server(server, {
//     cors: { origin: process.env.CLIENT_URL, methods: ["GET", "POST"] },
//   });

//   // ✅ Initialize ChatService with WebSocket
//   new ChatService(io);

//   const port = process.env.PORT || 3000;
//   server.listen(port, () => {
//     console.log(`🚀 Worker ${process.pid} running with WebSocket on port ${port}...`);
//   });

//   process.on("uncaughtException", (err) => {
//     console.error(`💥 Worker ${process.pid} UNCAUGHT EXCEPTION!`, err);
//     process.exit(1);
//   });

//   process.on("unhandledRejection", (err) => {
//     console.error(`⚠️ Worker ${process.pid} UNHANDLED REJECTION!`, err);
//     server.close(() => process.exit(1));
//   });

//   process.on("SIGTERM", () => {
//     console.log(`👋 Worker ${process.pid} shutting down...`);
//     server.close();
//   });
// }
