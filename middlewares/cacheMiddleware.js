

const redisClient = require("../redisClient");

exports.cachePage = async (req, res, next) => {
    try {
        const cacheKey = `page:${req.originalUrl}`;
        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            console.log(`⚡ Serving Cached Page: ${req.originalUrl}`);
            return res.send(cachedData);
        }

        // Override res.send to store response in cache
        const originalSend = res.send;
        res.send = async (body) => {
            await redisClient.set(cacheKey, body, 3600); // Cache for 1 hour
            originalSend.call(res, body);
        };

        next();
    } catch (error) {
        console.error("❌ Redis Cache Error:", error);
        next();
    }
};

