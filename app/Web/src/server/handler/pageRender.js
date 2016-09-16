var name = "page-render";
var pug = require('pug');
var path = require('path');
var md5File = require('md5-file');
var cache = require('lru-cache')({
    max: 10,
    length: function(n) {
        return n().length;
    }
});

// some helpers
var resolvePath = function(name) {
    return path.join(__dirname, `../../pug/${name}.pug`);
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

var compileTemplate = function(page) {
    return new Promise(function(resolve, reject) {
        var templatePath = resolvePath(page);
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

// main logic
module.exports = function(server) {
    server.on(name, function(data, socket) {
        compileTemplate(data.page).then(function(compile) {
            var html = compile(data.data);
            server.emit(socket, name, {
                status: 200,
                html
            });
        }, console.error);
    });
};
