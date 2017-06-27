var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = module.exports;

var defaultUri = 'mongodb://localhost/local';

/**
 * connect db
 * @example
 * db.connect('mongodb://localhost/local', {}, cb)
 * db.connect('mongodb://localhost/local', cb)
 * db.connect(cb)
 * db.connect('mongodb://localhost/local', true, cb)
 * db.connect(true, cb)
 * db.connect({}, true, cb)
 * @param uri
 * @param opts
 * @param cb
 * @return {*}
 */
db.connect = function(uri, opts, cb) {
    if(typeof uri === 'function'){
        cb = uri;
        uri = null;
        opts = {};
    } else if (typeof uri === 'object') {
        cb = opts;
        opts = uri;
        uri = null;
    }
    if(typeof(opts) === 'function') {
        cb = opts;
        opts = {};
    }

    uri || (uri = defaultUri);
    opts || (opts = {});
    opts.useMongoClient = true;

    return mongoose.connect(uri, opts, cb);
};

db.createConnection = function(uri, opts, cb) {
    if(typeof uri === 'function'){
        cb = uri;
        uri = null;
        opts = {};
    } else if (typeof uri === 'object') {
        cb = opts;
        opts = uri;
        uri = null;
    }
    if(typeof(opts) === 'function') {
        cb = opts;
        opts = {};
    }

    uri || (uri = defaultUri);
    opts || (opts = {});
    opts.useMongoClient = true;
    return mongoose.createConnection(uri, opts, cb);
};

db.disConnectAll = function() {
    mongoose.disconnect();
};
