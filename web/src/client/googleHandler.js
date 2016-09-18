var CLIENT_ID = "965582664362-1a786gbpf0d8dtefe5khl3iheoja4i0r.apps.googleusercontent.com";
var SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/plus.login",
    "https://www.googleapis.com/auth/plus.me"
];

module.exports = function(events) {
    var gapi;

    function checkAuth() {
        gapi = window.gapi;
        events.init(gapi);
        authorize(true);
    }

    function authorize(immediate) {
        gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES.join(" "),
            immediate
        }, handleAuthResult);
    }

    function handleAuthResult(authResult) {
        if (authResult && !authResult.error) {
            // user has signed in
            loadAPI([{
                name: 'calendar',
                ver: 'v3'
            }, {
                name: 'plus',
                ver: 'v1'
            }], events.signedIn);
        } else {
            // user need to authorize
            events.authorize(authResult);
        }
    }

    function loadAPI(apis, callback) {
        var api = apis.shift();
        gapi.client.load(api.name, api.ver, function() {
            if (apis.length > 0) {
                loadAPI(apis, callback);
            } else {
                callback();
            }
        });
    }

    window.checkAuth = checkAuth;
    return {
        authorize   
    };
};

