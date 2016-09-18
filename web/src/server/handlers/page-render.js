var name = "page-render";
var pug = require('pug');
var md5File = require('md5-file');

// cache for pug template compilers
var cache = require('lru-cache')({
    max: 10,
    length: function(n) {
        return n().length;
    }
});

// main logic
module.exports = function(server) {
    server.on(name, function(data, socket) {
        compilePage(data.page, data.data).then(function(html) {
            server.emit(socket, name, { status: 200, html });
        }, console.error.bind(console));
    });
};

// some helpers
var compilePage = function(page, data) {
    return new Promise(function(resolve, reject) {
        var templatePath = resolvePugPath(page);
        md5File(templatePath, function(err, hash) {
            if (err) {
                reject(err);
            } else {
                var compiler = getCompiler(templatePath, hash);
                var html = compiler(data);
                resolve(html);
            }
        });
    });
};

var getCompiler  = function(templatePath, hash) {
    var compiler = cache.get(hash);
    if (!compiler) {
        compiler = pug.compileFile(templatePath, {
            pretty: true
        });
    }
    return compiler;
};

var resolvePugPath = function(name) {
    return `${__root}/pug/${name}.pug`;
};

