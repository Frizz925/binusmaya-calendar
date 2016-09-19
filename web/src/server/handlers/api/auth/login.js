var name = "api/auth/login";

var request = require('server/request');
var client = require('server/factory/RedisFactory')();
var routing = require('server/routing');
var errorHandler = require('server/handlers/errorHandler')(name);
var ScheduleRepository = require('lib/Repository/Schedule');

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

var loginHandler = function(server, data) {
    return function(resp) {
        var body = resp.body;
        if (body.match(/iProfilePic/i)) {
            var cookie = request.getCookies()[0];
            client.set(data.uid + ":cookie", cookie.value);
            return cookie;
        } else if (body.match(/Invalid username/i)) {
            return Promise.reject({
                clientError: true,
                data: {
                    status: 400,
                    message: "Invalid username or password"
                }
            });
        } else {
            return Promise.reject({
                clientError: true,
                data: {
                    status: resp.response.statusCode,
                    message: resp.response.statusMessage
                }
            });
        }
    };
};

var fetchHandler = function(server, data, socket) {
    return function(resp) {
        var body = resp.body;
        var repository = new ScheduleRepository(body);
        var data = repository.future();
        /*
        fs.writeFileSync(
            path.join(__dirname, "../../../mock/schedule.json"), 
            JSON.stringify(data)
        );
        */
        server.emit(socket, name, {
            status: 200,
            message: "Schedule fetched",
            data
        });
    };
};
