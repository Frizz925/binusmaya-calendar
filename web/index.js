var ipc = require('node-ipc');
var path = require('path');
GLOBAL.__root = path.join(__dirname, 'src');

ipc.config = {
    id: "sock",
    appspace: "node.",
    socketRoot: __dirname + "/",
    retry: 500,
    silent: true,
    maxRetries: 10,
    maxConnections: 100
};

var handler = (name) => {
    return require(`server/handlers/${name}`);
};

ipc.serve(() => {
    handler("page-render")(ipc.server);
    handler("api/auth/login")(ipc.server);
    console.log("Server started");
});

ipc.server.start();

