const _ = require('lodash');
const moment = require('moment');
const Filter = require('./filter');
const Repository = require('../index');

const dateFormat = "YYYY-MM-DD";
const timeFormat = "HH:mm";
const dateTimeFormat = `${dateFormat} ${timeFormat}`;

const ScheduleRepository = function(data) {
    Repository.call(this, data);
    this._Filter = Filter;
};

ScheduleRepository.prototype = _.extend({}, Repository.prototype);

const fn = ScheduleRepository.prototype;
fn.constructor = ScheduleRepository;
fn.normalize = function(schedules) {
    return  _.map(schedules, normalizeSchedule);
};

function normalizeSchedule(schedule) {
    var startDateTime = startDateTimeFromSchedule(schedule);
    var finishDateTime = finishDateTimeFromSchedule(schedule);
    schedule.start = moment(startDateTime, dateTimeFormat);
    schedule.finish = moment(finishDateTime, dateTimeFormat);
    return schedule;
};

function startDateTimeFromSchedule(schedule) {
    return dateTimeFromSchedule(schedule, 'start');
}

function finishDateTimeFromSchedule(schedule) {
    return dateTimeFromSchedule(schedule, 'end');
}

function dateTimeFromSchedule(schedule, key) {
    // YYYY-MM-DD HH:mm:ss.SSS
    var date = schedule[key.toUpperCase() + "_DT"].split(" ")[0];
    // HH:mm
    var time = schedule["MEETING_TIME_" + key.toUpperCase()];
    return date + " " + time;
}

fn.future = function(options) {
    return this.time(function(now, schedule) {
        return schedule.start.isAfter(now);
    });
};

fn.past = function(options) {
    return this.time(function(now, schedule) {
        return schedule.finish.isBefore(now);
    });
};

fn.time = function(condition, options) {
    var now = moment();
    var result = _.filter(this._data, function(schedule) {
        return condition(now, schedule);
    });
    return this._filter(result, options);
};

module.exports = ScheduleRepository;
