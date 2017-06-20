var $ = {
    db: require('./db'),
    dao: require('./dao'),
    sequence: require('./sequence')
};

if (typeof global !== 'undefined' && global) {
    !global.jm && (global.jm = {});
    var jm = global.jm;
    for(key in $) jm[key] = $[key];
}

module.exports = $;
