var _ = require('lodash');

module.exports = function(gapi) {
    var self = {};

    function calendarExists(name) {
        return new Promise(function(resolve, reject) {
            var req = gapi.client.calendar.calendarList.list();
            req.execute(function(res) {
                var found = false;
                _.each(res.items, function(item) {
                    if (item.summary == name) {
                        found = true;
                        resolve(item.id);
                    }
                    return !found;
                });
                if (!found) {
                    reject();
                }
            });
        });
    }

    function createCalendar(name) {
        return new Promise(function(resolve) {
            var req = gapi.client.calendar.calendars.insert({
                summary: name
            });
            req.execute(function(res) {
                resolve(res.id);
            });
        });
    }

    function insertToCalendar(id, items, parser, progress) {
        var total = items.length;
        var count = 0;
        function insertEvent() {
            return new Promise(function(resolve) {
                var parsed = parser(items.shift());
                var payload = _.merge({
                    calendarId: id,
                    sendNotifications: true,
                    source: {
                        title: "Binusmaya Calendar",
                        url: "https://calendar.senakiho.tk"
                    }
                }, parsed);
                var req = gapi.client.calendar.events.insert(payload);
                req.execute(function(res) {
                    count++;
                    progress(count, total);
                    resolve(res);
                });
            });
        }

        return new Promise(function(resolve) {
            progress(count, total);

            function insert() {
                insertEvent().then(function() {
                    if (items.length > 0) {
                        insert();
                    } else {
                        resolve();
                    }
                });
            }

            insert();
        });
    }

    self.insert = function(name, items, parser, progress) {
        function doInsert(id) {
            return insertToCalendar(id, items, parser, progress);
        }

        return new Promise(function(resolve, reject) {
            calendarExists(name)
                .catch(function() {
                    return createCalendar(name);
                })
                .then(doInsert)
                .then(resolve)
                .catch(reject);
        });
    };

    return self;
};
