var scheduleTemplate = require('pug/pages/home/schedule.pug');
//var mockSchedule = require('../../mock/schedule.json');
var moment = require('moment');

var apiStatus = $("#api-status");
function updateStatus(message) {
    apiStatus.text(message);
}

var scheduleTable = $("#schedule-table");
function updateSchedule(schedules) {
    console.log(schedules);
    var html = scheduleTemplate({
        computed: {
            dateStart: function(schedule) {
                return moment(schedule.start).format("YYYY-MM-DD");
            },
            timeStart: function(schedule) {
                return moment(schedule.start).format("HH:mm");
            },
            timeFinish: function(schedule) {
                return moment(schedule.finish).format("HH:mm");
            }
        },
        data: schedules
    });
    scheduleTable.html(html);
}
//updateSchedule(mockSchedule);

var form = $("#login-form");
form.submit(function(evt) {
    evt.preventDefault();
    updateStatus("Logging in...");
    $.ajax({
        url: "/api/v1/auth/login",
        method: "POST",
        data: $.param({
            uid: form[0].uid.value,
            pass: form[0].pass.value
        }),
        success: function(data) {
            updateStatus(data.message);
            updateSchedule(data.data);
        },
        error: function(err) {
            var json = err.responseJSON;
            if (json) {
                updateStatus(json.message + " (" + err.status + ")");
            } else {
                updateStatus("Something went wrong. Check console for detail. (" + err.status + ")");
            }
            console.error(err);
        }
    });
});
