
// if (!global.redisClient) {
//     global.redisClient = {
//       get: (key) => {
//         return new Promise((resolve) => {
//           process.send({ type: "redis_get", key });
//           process.on("message", (message) => {
//             if (message.type === "redis_response" && message.key === key) {
//               resolve(message.value);
//             }
//           });
//         });
//       },
//       set: (key, value, ttl = 3600) => {
//         ttl = parseInt(ttl, 10);
//         if (isNaN(ttl) || ttl <= 0) ttl = 3600;
  
//         console.log(`🛠 Worker sending TTL: ${ttl}`);
  
//         process.send({
//           type: "redis_set",
//           key: key,
//           value: value,
//           ttl: ttl, // ✅ Ensure primitive number
//         });
//       },
//     };
//   }
  
//   module.exports = global.redisClient;
  
  
if (!global.redisClient) {
  global.redisClient = {
    // get: (key) => {
    //   return new Promise((resolve) => {
    //     process.send({ type: "redis_get", key });
    //     process.on("message", (message) => {
    //       if (message.type === "redis_response" && message.key === key) {
    //         resolve(message.value);
    //       }
    //     });
    //   });
    // },


    get: (key) => {
      return new Promise((resolve) => {
        const handler = (message) => {
          if (message.type === "redis_response" && message.key === key) {
            process.removeListener("message", handler);
            resolve(message.value);
          }
        };
        process.on("message", handler);
        process.send({ type: "redis_get", key });
      });
    },

    del: (key) => {
      process.send({ type: "redis_del", key });
    },
    

    // Standard set with default TTL
    set: (key, value, ttl = 3600) => {
      ttl = parseInt(ttl, 10);
      if (isNaN(ttl) || ttl <= 0) ttl = 3600;

      console.log(`🛠 Worker sending TTL: ${ttl}`);

      process.send({
        type: "redis_set",
        key: key,
        value: value,
        ttl: ttl,
      });
    },

    // ✅ Added setEx method
    setEx: (key, ttl, value) => {
      ttl = parseInt(ttl, 10);
      if (isNaN(ttl) || ttl <= 0) ttl = 3600;

      console.log(`🛠 Worker sending setEx with TTL: ${ttl}`);

      process.send({
        type: "redis_set",
        key: key,
        value: value,
        ttl: ttl,
      });
    }
  };
}

module.exports = global.redisClient;


