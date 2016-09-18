const _ = require('lodash');
const moment = require('moment');
const Filter = require('../filter');
const ScheduleFilter = function(arr, options) {
    return Filter.call(this, arr, options);
};

ScheduleFilter.prototype = _.extend({}, Filter.prototype);

ScheduleFilter.prototype.days = function(arr, options) {
    var start = moment();
    var finish = moment().add(options.days, 'days');
    return _.filter(arr, function(o) {
        return o.start.isBetween(start, finish, null, '[]');
    });
};

ScheduleFilter.prototype.weeks = function(arr, options) {
    return this.days(arr, {
        days: options.weeks * 7
    });
};

module.exports = Filter;
