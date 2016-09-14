var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var moment = require('moment');

var Repository = require('../src/schedule/repository.js');
var jsonPath = path.join(__dirname, "../mock/schedule.json");

describe("Schedule parsing test", function() {
    var repository, now;

    before(function() {
        var content = fs.readFileSync(jsonPath).toString();
        repository = new Repository(content);
        now = moment();
    });

    it("should show schedule from the future", function() {
        var schedules = repository.future();
        var scheduleTest = schedules[0];
        assert.isTrue(scheduleTest.start.isAfter(now));
        var formatted = scheduleTest.start.format("YYYY-MM-DD HH:mm");
        console.log(formatted);
    });

    it("should show schedule from the past", function() {
        var schedules = repository.past();
        var scheduleTest = schedules[schedules.length - 1];
        assert.isTrue(scheduleTest.start.isBefore(now));
        var formatted = scheduleTest.finish.format("YYYY-MM-DD HH:mm");
        console.log(formatted);
    });
});
