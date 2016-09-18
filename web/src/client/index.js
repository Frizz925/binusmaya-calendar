import Vue from 'vue';
import VueResource from 'vue-resource';
import moment from 'moment';
import ScheduleRepository from 'lib/Repository/Schedule';
import scheduleTemplate from 'pug/pages/home/schedule.pug';

Vue.use(VueResource);
Vue.config.debug = true;
Vue.config.async = false;

const repo = {
    schedule: new ScheduleRepository
};
const data = {
    status: "Waiting for login...",
    schedules: null,
    login: {},
    gauth: null
};

const methods = {};
methods.updateSchedules = function(schedules) {

};
methods.doLogin = function() {
    this.$http.post("/api/v1/auth/login", $.param(this.login))
    .then(resp => {
        console.log(resp);
    }, resp => {
        console.log(resp);
    });
    /*
    $.ajax({
        url: 
        method: "POST",
        data: $.param(this.login),
        success: data => {
            this.status = data.message;
            this.schedules = data.data;
        },
        error: err => {
            var json = err.responseJSON;
            if (json) {
                this.status = `${json.message} (${err.status})`;
            } else {
                this.status = `Something went wrong. Check console for detail. (${err.status})`;
            }
            console.error(err);
        }
    });
    */
};

new Vue({
    el: "body",
    data, methods
});

var schedules;
var scheduleContainer = $("#schedule-container");
function updateSchedule(_schedules) {
    var repo = new Repository(_schedules);
    var computed = {
        dateStart: schedule => moment(schedule.start).format("ddd, DD MMM YYYY"),
        timeStart: schedule => moment(schedule.start).format("HH:mm"),
        timeFinish: schedule => moment(schedule.finish).format("HH:mm")
    };
    schedules = repo.future({ weeks: 2 });
    console.log(schedules);

    scheduleContainer.empty();
    $.each(schedules, (idx, schedule) => {
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

/*
var googleHandlers = {
    calendar: require('./handlers/google/calendar'),
    client: require('./handlers/google/client')
};

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
*/
