var scheduleTemplate = require('pug/pages/home/schedule.pug');
var Repository = require('../lib/schedule/repository');
var mockSchedule = require('../../mock/schedule.json');
var moment = require('moment');

var googleHandlers = {
    calendar: require('./handlers/google/calendar'),
    client: require('./handlers/google/client')
};

var apiStatus = $("#api-status");
function updateStatus(message) {
    apiStatus.text(message);
}

var schedules;
var scheduleContainer = $("#schedule-container");
function updateSchedule(_schedules) {
    var repo = new Repository(_schedules);
    var computed = {
        dateStart: function(schedule) {
            return moment(schedule.start).format("ddd, DD MMM YYYY");
        },
        timeStart: function(schedule) {
            return moment(schedule.start).format("HH:mm");
        },
        timeFinish: function(schedule) {
            return moment(schedule.finish).format("HH:mm");
        }
    };
    schedules = repo.future({ weeks: 2 });
    console.log(schedules);

    scheduleContainer.empty();
    $.each(schedules, function(idx, schedule) {
        var local = $.extend({}, schedule, {
            type: schedule.N_DELIVERY_MODE + " - " + schedule.SSR_DESCR,
            course: schedule.CRSE_CODE + " - " + schedule.COURSE_TITLE_LONG,
            dateStart: computed.dateStart(schedule),
            timeStart: computed.timeStart(schedule),
            timeFinish: computed.timeFinish(schedule)
        });
        var html = scheduleTemplate(local);
        var el = $(html);
        scheduleContainer.append(el);
    });
}
updateSchedule(mockSchedule);

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

var gapi;
var btn = {
    google: $("#btn-google-signin"),
    calendar: $("#btn-add-calendar")
};
var handler = googleHandlers.client({
    init: function(_gapi) {
        gapi = _gapi;
    },
    signedIn: function() {
        btn.google.addClass("hidden");
        btn.calendar.removeClass("hidden");
        btn.calendar.click(addToCalendar);
    },
    authorize: function() {
        btn.calendar.addClass("hidden");
        btn.google.removeClass("hidden");
        btn.google.click(function() {
            handler.authorize(false);
        });
    }
});

var ModelView = function(el, model) {
    var self = {};
    var $views = [];
    var $el = el.jquery ? $(el) : el;
    $el.find("[data-bind]").each(function(idx, view) {
        var $view = $(view);
        var key = $view.attr("data-bind");
        $view.removeAttr("data-bind");
        $view.text(model[key]);
        var views = $views[key] || [];
        views.push($view);
        $views[key] = views;
    });

    function publish(key, value) {
        $.each($views[key] || [], function(idx, $view) {
            $view.text(value);
        });
    }

    self.set = function(key, value) {
        if (typeof key === 'object') {
            $.extend(model, key);
            $.each(key, publish);
        } else {
            model[key] = value;
            publish(key, value);
        }
    };

    return self;
};

var textProgress = $("#text-progress");
var progressMV = ModelView(textProgress, {
    count: 0,
    total: 0
});

function addToCalendar() {
    btn.calendar.addClass("hidden");
    textProgress.removeClass("hidden");

    var handler = googleHandlers.calendar(gapi);
    handler.insert(
        "Binusmaya Calendar Test", schedules, 
        function(item) {
            var rfc3339 = "YYYY-MM-DD[T]HH:mm:ss.SS[+07:00]";
            var timeZone = "Asia/Jakarta";
            return {
                summary: `[${item.N_DELIVERY_MODE}] ${item.CRSE_CODE}-${item.COURSE_TITLE_LONG}`,
                start: {
                    dateTime: item.start.format(rfc3339),
                    timeZone
                },
                end: {
                    dateTime: item.finish.format(rfc3339),
                    timeZone
                },
                location: `Binus ${item.LOCATION_DESCR} ${item.ROOM}`,
                description: `Class: ${item.CLASS_SECTION}\nSession: ${item.N_WEEK_SESSION}`
            };
        }, 
        function(count, total) {
            console.log(count, total);
            progressMV.set({ count, total });
        }
    ).then(function() {
        alert("Finish inserting schedules");
        btn.calendar.removeClass("hidden");
        textProgress.addClass("hidden");
    }).catch(console.error.bind(console));
}
