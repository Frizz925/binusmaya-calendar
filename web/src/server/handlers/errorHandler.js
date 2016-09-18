function handleError(name, server, data, socket) {
    return function(err) {
        if (err.clientError) {
            server.emit(socket, name, err.data);
        } else {
            console.error(err.stack);
            server.emit(socket, name, {
                status: 500,
                message: "Something wrong with the server"
            });
        }
    };
}

module.exports = function(name) {
    return function (server, data, socket) {
        return handleError(name, server, data, socket);
    };
};
