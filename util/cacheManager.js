// utils/cacheManager.js
const redisClient = require('../redisClient');

const DEFAULT_TTL = 3600; // default 1 hour

const getCache = async (key) => {
  try {
    const value = await redisClient.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error(`❌ Error getting cache for ${key}:`, err);
    return null;
  }
};

const setCache = async (key, value, ttl = DEFAULT_TTL) => {
  try {
    const data =  await redisClient.set(key, JSON.stringify(value), ttl);
    console.log(data)
  } catch (err) {
    console.error(`❌ Error setting cache for ${key}:`, err);
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
    console.log("delete")
  } catch (err) {
    console.error(`❌ Error deleting cache for ${key}:`, err);
  }
};

module.exports = {
  getCache,
  setCache,
  deleteCache,
};
