
// setup unix socket server and LRU cache
var ipc = require('node-ipc');
ipc.config = {
    id: "sock",
    appspace: "node.",
    socketRoot: __dirname + "/",
    retry: 500,
    silent: true,
    maxRetries: 10,
    maxConnections: 100
};

var handler = function(name) {
    return require('./src/server/handler/' + name + '.js');
};

// finally start the server
ipc.serve(function() {
    handler("pageRender")(ipc.server);
    handler("sysLogin")(ipc.server);
    console.log("Server started");
});

ipc.server.start();

