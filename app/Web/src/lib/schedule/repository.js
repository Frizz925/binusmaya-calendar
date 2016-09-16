var _ = require('lodash');
var moment = require('moment');

var dateFormat = "YYYY-MM-DD";
var timeFormat = "HH:mm";
var dateTimeFormat = dateFormat + " " + timeFormat;

var dateTimeFromSchedule = function(schedule, key) {
    // YYYY-MM-DD HH:mm:ss.SSS
    var date = schedule[key.toUpperCase() + "_DT"].split(" ")[0];
    // HH:mm
    var time = schedule["MEETING_TIME_" + key.toUpperCase()];
    return date + " " + time;
};

var startDateTimeFromSchedule = function(schedule) {
    return dateTimeFromSchedule(schedule, 'start');
};

var finishDateTimeFromSchedule = function(schedule) {
    return dateTimeFromSchedule(schedule, 'end');
};

var normalizeSchedule = function(schedule) {
    var startDateTime = startDateTimeFromSchedule(schedule);
    var finishDateTime = finishDateTimeFromSchedule(schedule);
    schedule.start = moment(startDateTime, dateTimeFormat);
    schedule.finish = moment(finishDateTime, dateTimeFormat);
    return schedule;
};

var normalizeSchedules = function(schedules) {
    return  _.map(schedules, normalizeSchedule);
};

module.exports = function(data) {
    var self = this;
    var json = _.isString(data) ? JSON.parse(data) : data;
    var schedules = normalizeSchedules(json);

    self.filter = function(filter) {
        var result = [];
        _.each(schedules, function(schedule) {
            if (filter(schedule)) {
                result.push(schedule);
            }
        });
        return result;
    };

    self.filterTime = function(condition) {
        var now = moment();
        return self.filter(function(schedule) {
            return condition(now, schedule);
        });
    };

    self.future = function() {
        return self.filterTime(function(now, schedule) {
            return schedule.start.isAfter(now);
        });
    };

    self.past = function() {
        return self.filterTime(function(now, schedule) {
            return schedule.finish.isBefore(now);
        });
    };

    self.all = function() {
        return schedules;
    };
};
