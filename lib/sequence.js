var Promise = require('bluebird');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dao = require('./dao');

var schemaDefine = {
    name: String,
    value: Number,
    maxvalue: Number
};
var defaultSchema = new Schema(schemaDefine);

module.exports = function (opts) {
    opts = opts || {};
    opts.schema = opts.schema || defaultSchema;
    opts.modelName = opts.modelName || 'sequence';

    var model = dao(opts);

    model.next = function (name, opts, cb) {
        if (cb) {
            this.next(name, opts)
                .then(function (doc) {
                    cb(null, doc);
                })
                .catch(cb);
            ;
            return this;
        }
        opts = opts || {};
        var increase = opts.increase || 1;
        return this.collection.findAndModify(
            {name: name},
            [],
            {$inc: {value: increase}},
            {
                'new': true,
                'upsert': true
            })
            .then(function (doc) {
                return Promise.resolve(doc.value.value);
            });
    };

    return model;
};


