var mongoose = require('mongoose');
var db = module.exports;

var connections = {};

var defaultUri = 'mongodb://localhost/local';
db.connect = function(uri, newConnection, cb) {
    uri = uri || defaultUri;
    var o = connections[uri];
    if(o){
        o.reference++;
        if(cb){
            cb(null, o);
            return;
        }else{
            return o;
        }
    }
    if(newConnection){
        o = mongoose.createConnection(uri);
        if(o){
            connections[uri] = o;
            o.reference = 1;
        }
        if(cb){
            cb(null, o);
            return;
        }else{
            return o;
        }
    }
    mongoose.connect(uri, function(err) {
        if (err){
            console.warn('DB#connect ' + err + ' ' + uri);
        }
    });
    o = mongoose.connection;
    connections[uri] = o;
    o.reference = 1;
    if(cb){
        cb(null, o);
        return;
    }else{
        return o;
    }
};

db.disConnect = function(uri) {
    uri = uri || defaultUri;
    var o = connections[uri];
    if(o && o.reference){
        o.reference--;
        if(o.reference==0){
            o.close();
            delete connections[uri];
        }
    }
};

db.disConnectAll = function() {
    connections = {};
    mongoose.disconnect();
};
