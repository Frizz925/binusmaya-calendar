var scheduleTemplate = require('pug/pages/home/schedule.pug');
var data = { };
var html = scheduleTemplate(data);
$("#schedule-container").html(html);
