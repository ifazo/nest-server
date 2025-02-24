import { createClient } from 'redis';

const redis = createClient();

redis.on('error', (err) => console.error('Redis Client Error:', err));

redis
  .connect()
  .then(() => console.log('Connected to Redis'))
  .catch((error) => console.error('Failed to connect to Redis:', error));

export default redis;
