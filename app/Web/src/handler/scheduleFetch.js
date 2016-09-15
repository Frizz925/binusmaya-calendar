var request = require('../request');
var name = "schedule-fetch";

var loginHandler = function(server, data, socket) {
    return function(resp) {
        var body = resp.body;
        if (body.match(/Invalid username/i)) {
            server.emit(socket, name, {
                status: 400,
                message: "Invalid username or password"
            });
        } else {
            server.emit(socket, name, {
                status: 200,
                message: "Login success"
            });
        }
    };
};

module.exports = function(server) {
    return function(data, socket) {
        request.createFormRequest("/login/sys_login.php", data)
            .then(loginHandler(server, data, socket))
            .catch(console.error);
    };
};
