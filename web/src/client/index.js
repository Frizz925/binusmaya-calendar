import _ from 'lodash';
import Vue from 'vue';
import VueResource from 'vue-resource';
import moment from 'moment';
import ScheduleRepository from 'lib/Repository/Schedule';

Vue.use(VueResource);
Vue.config.debug = true;
Vue.config.async = false;

const $repo = {
    schedule: new ScheduleRepository
};
const data = {
    status: {
        text: "Waiting for login",
        error: false
    },
    schedules: null,
    login: {},
    gauth: null,
    isInserting: false
};

const methods = {};
methods.doLogin = function() {
    this.$set('status', {
        text: "Logging in... (0:00)",
        error: false
    });

    var time = 0;
    var start = moment();
    var interval = setInterval(() => {
        time++;
        if (time % 30 == 0) {
            time = moment().diff(start, 'seconds');
        }
        var minutes = _.padStart(Math.floor(time / 60), 2, '0');
        var seconds = _.padStart(time % 60, 2, '0');
        this.status.text = `Logging in... (${minutes}:${seconds})`;
    }, 1000);

    this.$http.post("/api/v1/auth/login", this.login, {
        emulateJSON: true
    }).then(resp => {
        clearInterval(interval);
        console.log(resp);
        var body = resp.body;
        this.status.text = `${body.message}`;
        this.updateSchedules(body.data);
    }, resp => {
        clearInterval(interval);
        console.error(resp);
        var body = resp.body;
        if (_.isObject(body)) {
            this.status.text = `${body.message} (${resp.status})`;
        } else {
            this.status.text = `${resp.statusText} (${resp.status})`;
        }
        this.status.error = true;
    });
};
methods.updateSchedules = function(schedules) {
    var repo = $repo.schedule;
    repo.store(schedules);
    this.$set('schedules', repo.future({ weeks: 2 }));
};
methods.dateStart = schedule => moment(schedule.start).format("ddd, DD MMM YYYY");
methods.timeStart = schedule => moment(schedule.start).format("HH:mm");
methods.timeFinish = schedule => moment(schedule.finish).format("HH:mm");

new Vue({
    el: "body",
    data, methods
});

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
