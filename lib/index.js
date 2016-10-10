var  db = require('./db')
    , jm = require('jm-core')

jm.DB = db;

jm.dao = require('./dao');
jm.router = require('./router');
jm.router_array = require('./router_array');
jm.sequence = require('./sequence');

module.exports = jm;
