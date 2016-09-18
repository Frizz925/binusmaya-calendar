const debug = true;
var _ = require('lodash');
var querystring = require('querystring');

var baseUrl = "https://binusmaya.binus.ac.id";
var servicePath = "/services/ci/index.php";

var request = require('request');
var cookieJar = request.jar();
request = request.defaults({
    method: "GET",
    followRedirect: true,
    followAllRedirects: true,
    jar: cookieJar,
    baseUrl
});

function createRequest(path, options) {
    options = _.merge({
        uri: path,
        method: "GET"
    }, options || {});

    return new Promise(function(resolve, reject) {
        request(options, function(err, response, body) {
            if (err) {
                reject(err);
            } else {
                resolve({ response, body });
            }
        });
    });
}

function createServiceRequest(path, options) {
    options = _.merge({
        headers: {
            "Referer": "https://binusmaya.binus.ac.id/newStudent/index.html",
            "Cache-Control": "no-cache"
        }
    }, options);
    return createRequest(servicePath + path, options);
}

function createFormRequest(path, data, options) {
    var body = querystring.stringify(data);
    var length = body.length;

    options = _.merge({
        body,
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Content-Length": length
        }
    }, options || {});
    return createRequest(path, options);
}

function getCookies() {
    return cookieJar.getCookies(baseUrl);
}

module.exports = {
    request,
    createRequest,
    createServiceRequest,
    createFormRequest,
    baseUrl,
    servicePath,
    cookieJar,
    getCookies
};
