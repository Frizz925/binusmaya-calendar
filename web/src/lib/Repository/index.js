const _ = require('lodash');
const moment = require('moment');
const Filter = require('./filter');

const Repository = function(data) {
    this._data = null;
    this._filter = Filter;
    this.store(data);
};

const fn = Repository.prototype = {};
    
fn.store = function(data) {
    try {
        var json = _.isString(data) ? JSON.parse(data) : data;
    } catch (e) {
        throw new Error(`Error parsing to JSON: ${data}`);
    }
    this._data = this.normalize(json);
    return this;
};

fn.normalize = function(data) {
    return data;
};

fn.all = function() {
    return this._data.slice();
};

fn.filter = function(options) {
    return this._filter(this._data, options);
};

module.exports = Repository;
