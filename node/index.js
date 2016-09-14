var fs = require('fs');
var login = require('./mock/login');
var request = require('./src/request');

function doLogin(login) {
    return request.createFormRequest("/login/sys_login.php", login);
}

function doSwitchRole() {
    return request.createServiceRequest("/login/switchrole/2/104");
}

function doFetch() {
    return request.createServiceRequest("/student/class_schedule/classScheduleGetStudentClassSchedule");
}

function saveSchedule(resp) {
    fs.writeFile("mock/schedule.json", resp.body);
}

function handleError(err) {
    console.error(err);
}

doLogin(login)
    .then(function(resp) {
        if (resp.body.match(/Invalid username or password/i)) {
            return Promise.reject(new Error("Failed to login"));
        } else {
            return doSwitchRole();
        }
    })
    .then(doFetch)
    .then(saveSchedule)
    .catch(handleError);
