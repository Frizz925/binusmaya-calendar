const _ = require('lodash');
const Filter = function(arr, options) {   
    var result = arr.slice();
    options = options || {};
    _.each(options, function(opt, key) {
        if (Filter.prototype[key]) {
            result = this[key](result, options);
        }
    });
    return result;
};

Filter.prototype.size = function(arr, options) {
    var start = options.start || 0;
    return _.slice(arr, start, start + options.size);
};

module.exports = Filter;
