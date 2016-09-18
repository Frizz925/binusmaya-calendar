const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const moment = require('moment');

const Repository = require('../src/lib/Repository/Schedule');
const jsonPath = path.join(__dirname, "mock/schedule.json");

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
    });

    it("should show schedule from the past", function() {
        var schedules = repository.past();
        var scheduleTest = schedules[schedules.length - 1];
        assert.isTrue(scheduleTest.finish.isBefore(now));
        var formatted = scheduleTest.finish.format("YYYY-MM-DD HH:mm");
    });
});
