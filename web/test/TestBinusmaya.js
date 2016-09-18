const login = require('./mock/login');
const request = require('../src/server/request');

const fs = require('fs');
const path = require('path');
const jsonPath = path.join(__dirname, "mock/schedule.json");

function doLogin(login) {
    return new Promise(function(resolve, reject) {
        request.createFormRequest("/login/sys_login.php", login)
            .then(function(resp) {
                if (resp.body.match(/Invalid username or password/i)) {
                    return reject(new Error("Failed to login"));
                } else {
                    return resolve(resp);
                }
            })
            .catch(reject);
    });
}

function doSwitchRole() {
    return request.createServiceRequest("/login/switchrole/2/104");
}

function doFetch() {
    return request.createServiceRequest("/student/class_schedule/classScheduleGetStudentClassSchedule");
}

describe("Binusmaya Web API test", function() {
    this.timeout(30 * 1000);

    it("should NOT be able to login", function(done) {
        doLogin({
            uid: "fake",
            pass: "fakepass"
        }).then(function() {
            done(new Error("Able to login"));
        }).catch(function() {
            done();
        });
    });

    it("should be able to login", function(done) {
        doLogin(login).then(function() {
            done();
        }, done);
    });

    it("should be able to switch role", function(done) {
        doSwitchRole().then(function() {
            done();
        }, done);
    });

    it("should fetch schedule", function(done) {
        doFetch().then(function(resp) {
            var body = resp.body;
            var json = JSON.parse(body);
            if (json.length > 0) {
                fs.writeFileSync(jsonPath, body);
                done();
            } else {
                done(new Error("No schedule fetched"));
            }
        }, done);
    });
});

