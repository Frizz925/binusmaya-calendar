var pug = require('pug');
var path = require('path');
var redis = require('redis');
var md5File = require('md5-file');
var LRU = require('lru-cache');

// setup the redis client and LRU cache
var redisOptions = {
    path: "/var/run/redis/redis.sock"
};
var sub = redis.createClient(redisOptions);
var pub = redis.createClient(redisOptions);

var cache = LRU({
    max: 10,
    length: function(n) {
        return n().length;
    }
});

// some helpers
var resolvePath = function(name) {
    return path.join(__dirname, `src/pug/${name}.pug`);
};

var compileCache = function(templatePath, hash) {
    var compile = cache.get(hash);
    if (!compile) {
        compile = pug.compileFile(templatePath, {
            pretty: true
        });
    }
    return compile;
};

var compileTemplate = function(name) {
    return new Promise(function(resolve, reject) {
        var templatePath = resolvePath(name);
        md5File(templatePath, function(err, hash) {
            if (err) {
                reject(err);
            } else {
                var compile = compileCache(templatePath, hash);
                resolve(compile);
            }
        });
    });
};

// logic goes here
var subPattern = "node-renderer-req-*";
sub.on("psubscribe", function(pattern, count) {
    console.log("Subscribed to " + pattern + " with " + count + " subs");
});

sub.on("pmessage", function(pattern, channel, message) {
    if (channel.match(/^node-renderer-req/)) {
        var json = JSON.parse(message);
        var name = json.path;
        compileTemplate(name).then(function(compile) {
            var html = compile(json.data);
            pub.publish("node-renderer-res-" + json.uuid, html);
            console.log("Rendered " + name);
        }, console.error);
    }
});

sub.psubscribe(subPattern);

