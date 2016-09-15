
// setup unix socket server and LRU cache
var ipc = require('node-ipc');
ipc.config = {
    id: "sock",
    appspace: "node.",
    socketRoot: __dirname + "/",
    retry: 500,
    maxRetries: 10,
    maxConnections: 100
};

var handler = function(name) {
    return require('./src/handler/' + name + '.js')(ipc.server);
};

// finally start the server
ipc.serve(function() {
    ipc.server.on('page-render', handler("pageRender"));
    ipc.server.on('schedule-fetch', handler("scheduleFetch"));
});

ipc.server.start();

