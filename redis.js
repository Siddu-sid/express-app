const express = require('express');
const jwt = require('jsonwebtoken');
const redis = require('redis');
const {createClient} = require('redis');

const redisClient = createClient({
    host: 'localhost',
    port: 6379
});
// Ensure Redis is connected before accepting requests
redisClient.connect()
  .then(() => {
    console.log('✅ Connected to Redis');
  })
  .catch(err => {
    console.error('❌ Redis connection error:', err);
    process.exit(1); // Exit if Redis connection fails
  });

  exports.redisClient = redisClient;