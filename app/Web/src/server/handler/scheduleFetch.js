var name = "schedule-fetch";
var errorHandler = require('./errorHandler')(name);
var request = require('../request');
var routing = require('../routing');

var fetchHandler = function(server, data, socket) {
    return function(resp) {
        var body = resp.body;
        var json = JSON.parse(body);
        server.emit(socket, name, json);
    };
};

module.exports = function(server) {
    server.on(name, function(data, socket) {
        request.createServiceRequest(routing.service.switchRole)
            .then(request.createServiceRequest(routing.service.getSchedule))
            .then(fetchHandler(server, data, socket))
            .catch(errorHandler(server, data, socket));
    });
};
