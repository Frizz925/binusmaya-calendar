const _ = require('lodash');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

var Google = require('googleapis');
var GoogleAuth = require('google-auth-library');

const CALENDAR_NAME = "Binusmaya Calendar Test";
const SCOPES = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/plus.login',
    'https://www.googleapis.com/auth/plus.me'
];
const TOKEN_PATH = path.join(__dirname, "../credentials/binusmaya-calendar-test.json");
const SECRET_PATH = path.join(__dirname, "../credentials/client_secret.json");

describe("Google Calendar test", function() {
    this.timeout(30 * 1000);
    var auth, event, calendar, calendarAPI, calendarList;

    // make sure the calendar doesn't exist by removing it first
    before(function(done) {
        calendarAPI = Google.calendar('v3');

        var content = fs.readFileSync(SECRET_PATH);
        var credentials = JSON.parse(content);
        
        var clientSecret = credentials.installed.client_secret;
        var clientId = credentials.installed.client_id;
        var redirectUrl = credentials.installed.redirect_uris[0];
        var gauth = new GoogleAuth();
        auth = new gauth.OAuth2(clientId, clientSecret, redirectUrl);

        var callback = function() {
            listCalendar().then(function() {
                setTimeout(done, 500);
            }, done);
        };
        try {
            var token = fs.readFileSync(TOKEN_PATH);
            auth.credentials = JSON.parse(token);
            callback();
        } catch (e) {
            getNewToken(auth).then(callback);
        }
    });

    it("should create the new calendar", function(done) {
        calendarAPI.calendars.insert({
            auth,
            resource: {
                summary: CALENDAR_NAME
            }
        }, function(err) {
            if (err) {
                done(err);
            } else {
                setTimeout(done, 500);
            }
        });
    });

    it("should have the calendar", function(done) {
        listCalendar().then(function(calendar) {
            if (calendar) {
                setTimeout(done, 500);
            } else {
                done(new Error("Calendar does not exists!"));
            }
        });
    });

    it("should insert a new event to the calendar", function(done) {
        calendarAPI.events.insert({
            auth,
            calendarId: calendar.id,
            resource: {
                summary: "Event test",
                start: {
                    dateTime: moment().toDate()
                },
                end: {
                    dateTime: moment().add(5, "hours").toDate()
                }
            }
        }, function(err, resp) {
            if (err) {
                done(err);
            } else {
                event = resp;
                setTimeout(done, 500);
            }
        });
    });

    it("should have the event in the calendar", function(done) {
        calendarAPI.events.get({
            calendarId: calendar.id,
            eventId: event.id
        }, function(err) {
            if (err) {
                done(err);
            } else {
                setTimeout(done, 500);
            }
        });
    });

    it("should delete the event from the calendar", function(done) {
        calendarAPI.events.delete({
            calendarId: calendar.id,
            eventId: event.id
        }, function(err) {
            if (err) {
                done(err);
            } else {
                setTimeout(done, 500);
            }
        });
    });

    it("should delete the calendar", function(done) {
        calendarAPI.calendars.delete({
            auth,
            calendarId: calendar.id
        }, function(err) {
            if (err) {
                done(err);
            } else {
                setTimeout(done, 500);
            }
        });
    });

    it("should not have the calendar", function(done) {
        calendarAPI.calendars.get({
            calendarId: calendar.id
        }, function(err) {
            if (!err) {
                done(new Error("Calendar still exists!"));
            } else {
                setTimeout(done, 500);
            }
        });
    });

    function listCalendar() {
        return new Promise(function(resolve, reject) {
            calendarAPI.calendarList.list({
                auth
            }, function(err, res) {
                if (err) {
                    reject(err);
                    return;
                }
                calendarList = res.items;
                _.each(calendarList, function(_calendar) {
                    // find calendar to remove later
                    if (_calendar.summary == CALENDAR_NAME) {
                        calendar = _calendar;
                        return false;
                    }
                });
                resolve(calendar);
            });
        });
    }

    function getNewToken(auth) {
        var resolveToken = function(resolve, reject) {
            return function(err, token) {
                if (err) {
                    reject(err);
                    return;
                }
                auth.credentials = token;
                storeToken(token);
                resolve();
            };
        };

        return new Promise(function(resolve, reject) {
            var authUrl = auth.generateAuthUrl({
                access_type: "offline",
                scope: SCOPES
            });
            console.log(`Authorize this app by visiting this url: ${authUrl}`);

            var rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout
            });
            rl.question("Enter the code from that page here: ", function(code) {
                rl.close();
                auth.getToken(code, resolveToken(resolve, reject));
            });
        });
    }

    function storeToken(token) {
        fs.writeFile(TOKEN_PATH, JSON.stringify(token));
        console.log(`Token stored to ${TOKEN_PATH}`);
    }
});
