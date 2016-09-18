var redis = require('redis');
var globals = require('server/globals');

module.exports = function(path) {
    path = path || globals.redisSock;
    return redis.createClient(path);
};
