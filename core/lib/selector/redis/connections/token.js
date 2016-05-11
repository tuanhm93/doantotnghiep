var redis = require('redis');
var Promise = require('bluebird');
var config = require('config');
var tokenRedisConfig = config.redis.token;

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

var client = redis.createClient(tokenRedisConfig.port, tokenRedisConfig.host, {
	password: tokenRedisConfig.auth
});

if (tokenRedisConfig.database) {
    client.select(tokenRedisConfig.database, redis.print);
}

if (tokenRedisConfig.auth) {
	console.log(tokenRedisConfig.auth);
    // client.auth(tokenRedisConfig.auth, redis.print);
}

client.on('connected', function () {
    console.log('Redis connected at: ', new Date().toString());
});

client.on('error', function (err) {
    console.trace(err);
    console.log('Redis error at: ', new Date().toString(), ', msg: ', err);
    client = redis.createClient(tokenRedisConfig.port, tokenRedisConfig.host);
    if (tokenRedisConfig.database) {
        client.select(tokenRedisConfig.database, redis.print);
    }
});

module.exports = client;