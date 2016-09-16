var name = "sys-login";

var fs = require('fs');
var path = require('path');

var errorHandler = require('./errorHandler')(name);
var request = require('../request');
var client = require('../factory/RedisFactory')();
var routing = require('../routing');
var Repository = require('../../lib/schedule/repository.js');

var loginHandler = function(server, data) {
    return function(resp) {
        var body = resp.body;
        if (body.match(/Invalid username/i)) {
            return Promise.reject({
                clientError: true,
                data: {
                    status: 400,
                    message: "Invalid username or password"
                }
            });
        } else {
            var cookie = request.getCookies()[0];
            client.set(data.uid + ":cookie", cookie.value);
            return cookie;
        }
    };
};

var fetchHandler = function(server, data, socket) {
    return function(resp) {
        var body = resp.body;
        var repository = new Repository(body);
        var data = repository.future();
        fs.writeFileSync(
            path.join(__dirname, "../../../mock/schedule.json"), 
            JSON.stringify(data)
        );
        server.emit(socket, name, {
            status: 200,
            message: "Schedule fetched",
            data
        });
    };
};

module.exports = function(server) {
    server.on(name, function(data, socket) {
        request.createFormRequest(routing.login, data)
            .then(loginHandler(server, data, socket))
            .then(function() {
                return request.createServiceRequest(routing.service.switchRole);
            })
            .then(function() {
                return request.createServiceRequest(routing.service.getSchedule);
            })
            .then(fetchHandler(server, data, socket))
            .catch(errorHandler(server, data, socket));
    });
};
