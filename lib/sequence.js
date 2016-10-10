var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var dao = require('./dao');

var schemaDefine = {
    name : String,
    value : Number,
    maxvalue:Number
};
var defaultSchema = new Schema(schemaDefine);

module.exports = function(opts) {
    opts = opts || {};
    opts.schema = opts.schema || defaultSchema;
    opts.modelName = opts.modelName || 'sequence';

    var model = dao(opts);

    model.next = function(name, opts, cb) {
        opts = opts || {};
        var increase = opts.increase || 1;
        this.collection.findAndModify(
            {name: name },
            [],
            {$inc:{value: increase}},
            {
                'new':true,
                'upsert':true
            },
            function (err, doc) {
                cb(err, doc.value.value);
            }
        );
    };

    return model;
};


