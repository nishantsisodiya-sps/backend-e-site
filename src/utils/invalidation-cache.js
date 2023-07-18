const redis = require('redis')
const client =  redis.createClient({legacyMode : true})
client.connect()



// Function to invalidate the cache for user's orders
const invalidateUserOrdersCache = (userId) => {
  const cacheKey = `orders:${userId}`;
  client.del(cacheKey, (err, result) => {
    if (err) {
      console.error('Redis delete error:', err);
    } else {
      console.log(`Cache invalidated for ${cacheKey}`);
    }
  });
};

// Function to invalidate the cache for a single order
const invalidateSingleOrderCache = (orderId, productId) => {
  const cacheKey = `singleOrder:${orderId}:${productId}`;
  client.del(cacheKey, (err, result) => {
    if (err) {
      console.error('Redis delete error:', err);
    } else {
      console.log(`Cache invalidated for ${cacheKey}`);
    }
  });
};



//Function to invalidate the cache for get products 
const invalidateProductsCache = () => {
    const cachePattern = 'products:*';
    client.keys(cachePattern, (err, keys) => {
      if (err) {
        console.error('Redis keys error:', err);
        return;
      }
  
      if (keys.length === 0) {
        console.log('No cache keys found matching the pattern:', cachePattern);
        return;
      }
  
      client.del(keys, (delErr, count) => {
        if (delErr) {
          console.error('Redis delete error:', delErr);
          return;
        }
  
        console.log(`Successfully invalidated ${count} cache keys`);
      });
    });
  };

module.exports = {
  invalidateUserOrdersCache,
  invalidateSingleOrderCache,
  invalidateProductsCache
};
