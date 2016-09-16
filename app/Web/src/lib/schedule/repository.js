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

var filters = {};
filters.size = function(arr, options) {
    var start = options.start || 0;
    return _.slice(arr, start, start + options.size);
};
filters.days = function(arr, options) {
    var sample = arr[0].start;
    var start = moment(sample);
    var finish = moment(sample).add(options.days, 'days');
    return _.filter(arr, function(o) {
        return o.start.isBetween(start, finish, null, '[]');
    });
};
filters.weeks = function(arr, options) {
    return filters.days(arr, {
        days: options.weeks * 7
    });
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

    function filterOptions(schedules, options) {
        options = options || {};
        var result = schedules;
        _.each(options, function(opt, key) {
            result = filters[key](result, options);
        });
        return result;
    }

    self.future = function(options) {
        var result = self.filterTime(function(now, schedule) {
            return schedule.start.isAfter(now);
        });
        return filterOptions(result, options);
    };

    self.past = function(options) {
        var result = self.filterTime(function(now, schedule) {
            return schedule.finish.isBefore(now);
        });
        return filterOptions(result, options);
    };

    self.all = function(options) {
        return filterOptions(schedules, options);
    };
};
