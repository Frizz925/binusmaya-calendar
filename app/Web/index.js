var jade = require('jade');
var path = require('path');
var resolvePath = function(name) {
    return path.join(__dirname, `src/jade/${name}.jade`);
};

var options = {
    pretty: true
};
var json = JSON.parse(process.argv[2]);
var html = jade.compileFile(resolvePath("index"), options);
process.stdout.write(html(json));

