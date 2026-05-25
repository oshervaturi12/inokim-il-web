const redisClient = require("../redisClient");

async function cacheQuery(key, queryFn, ttl = 3600) {
    try {
      ttl = parseInt(ttl, 10);
      if (isNaN(ttl) || ttl <= 0) ttl = 3600;
  
      console.log(`🛠 Caching ${key} with TTL:`, ttl);
  
      const cached = await redisClient.get(key);
      if (cached) {
        console.log(`⚡ Serving Cached Query: ${key}`);
        return JSON.parse(cached);
      }
  
      const result = await queryFn();

      await redisClient.set(key, JSON.stringify(result), ttl); // ✅ FIXED
  
      console.log(`✅ Cached ${key} for ${ttl} seconds.`);
      return result;
    } catch (error) {
      console.error(`❌ Redis Query Cache Error:`, error);
      return await queryFn();
    }
}
  
module.exports = { cacheQuery };
