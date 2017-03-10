var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var array = require('./dao_array.js');

module.exports = function(opts) {
    var model = opts;
    if(opts.modelName && opts.schema){
        var db = opts.db || mongoose;
        var schema = opts.schema;
        if(opts.schemaExt){
            schema.add(opts.schemaExt);
        }
        model = db.model(opts.modelName, schema);
    }

    /*
     opts
     {
     conditions:?,
     fileds:?,
     options:?,
     populations:?,
     }
     */
    model.findOne2 = function (opts, cb) {
        var self = this;
        opts = opts || {};
        var options = opts.options || null;
        var conditions = opts.conditions || {};
        var fields = opts.fields || null;
        var populations = opts.populations || null;
        var q = self.findOne(conditions, fields, options);
        if(opts.lean) q.lean();
        if(populations)
            q.populate(populations);
        if(cb) q.exec(cb);
        return q;
    };

    model.findById2 = function (id, opts, callback) {
        var self = this;
        opts = opts || {};
        opts.conditions = {_id: id};
        return self.findOne2(opts, callback);
    };

    /*
     opts
     {
     page:?,
     rows:?,
     conditions:?,
     fileds:?,
     options:?,
     populations:?,
     }
     */
    model.find2 = function (opts, cb) {
        var self = this;
        opts = opts || {};
        var options = opts.options || null;
        var conditions = opts.conditions || {};
        var fields = opts.fields || null;
        var populations = opts.populations || null;
        if(opts.page || opts.rows){
            var page = opts.page || 1;
            var rows = opts.rows || 10;
            page = Number(page);
            rows = Number(rows);
            options = options || {};
            options.skip = (page-1)*rows;
            options.limit = rows;

            self.count(conditions, function (err, count) {
                if(err){
                    return cb(err);
                }

                var data = {
                    page: page,
                    total: count,
                    pages: 0,
                    rows:[]
                };
                if(!count){
                    cb(null, data);
                }else{
                    var q = self.find(conditions, fields, options);
                    if(opts.lean) q.lean();
                    if(populations)
                        q.populate(populations);

                    q.exec(function(err, doc){
                        if(err){
                            return cb(err);
                        }
                        data.pages = Math.ceil(count / rows);
                        data.rows = doc;
                        cb(null, data);
                    });
                    return q;
                }
            });
        }else{
            var q = self.find(conditions, fields, options);
            if(opts.lean) q.lean();
            if(populations)
                q.populate(populations);
            if(cb) q.exec(cb);
            return q;
        }
    };

    /**
     * 绑定一个数字类型的字段, 使得model拥有对该书组字段的操作方法
     * @param opts
     * example：
     * {
     *      field: 字段名称
            bind: 绑定后名称
            key: 关键字段
     * }
     */
    model.bindArrayField = function(opts) {
        array(model, opts);
    };

    return model;
};

