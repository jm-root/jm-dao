var _ = require('lodash');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = function (dao, opts) {
    var field = opts.field;

    var model = dao;

    var obj = {
        field: field

        ,formatConditions: function(conditions){
            if(_.isPlainObject(conditions)){
                var _id = conditions._id;
                if(_id) conditions._id = ObjectId.isValid(_id)&&new ObjectId(_id)||_id;
                var id = conditions.id;
                if(id) conditions.id = ObjectId.isValid(id)&&new ObjectId(id)||id;
                var $ = conditions.$;
                if($) conditions = conditions.$;
            }else{
                conditions = ObjectId.isValid(conditions)&&new ObjectId(conditions)||conditions;
            }
            return conditions;
        }

        ,findOne: function(id, opts, cb){
            opts = opts || {};
            cb = cb||function(){};
            var conditions = opts.conditions || {};
            var population = opts.population || false;
            if(population){
                if(typeof population==='boolean'||!_.isPlainObject(population)) population={};
                population.path = field;
            }

            var q = model.findById(id);
            if(population){
                q.populate(population);
            }
            if(opts.lean) q.lean();
            q.exec(function (err, doc) {
                if(err){
                    return cb(err);
                }
                var ary = doc[field];
                if(ary==undefined){
                    return cb(field+" doesn't exist");
                }
                conditions = obj.formatConditions(conditions);
                var one;
                if(_.isPlainObject(conditions)){
                    one = _.find(ary, conditions)||null;
                }else{
                    var pos = _.indexOf(ary,conditions);
                    one = pos!=-1 ? ary[pos] : null;
                }

                cb(null,one);
            });
        }

        ,find: function(id, opts, cb){
            opts = opts || {};
            cb = cb||function(){};
            var conditions = opts.conditions || {};
            var population = opts.population || false;
            if(population){
                if(typeof population==='boolean'||!_.isPlainObject(population)) population={};
                population.path = field;
            }

            var q = model.findById(id);
            if(population){
                q.populate(population);
            }
            if(opts.lean) q.lean();
            q.exec(function (err, doc) {
                if(err){
                    return cb(err);
                }
                var ary = doc[field];
                if(ary==undefined){
                    return cb(field+" doesn't exist");
                }
                var multiple = null;
                if(_.isPlainObject(conditions)&&_.isEmpty(conditions)){
                    multiple = ary;
                }else{
                    conditions = obj.formatConditions(conditions);
                    multiple = _.where(ary, conditions)||null;
                }

                cb(null,multiple);
            });
        }

        ,remove: function(id, conditions, cb){
            conditions = conditions || {};
            cb = cb||function(){};
            var q = model.findById(id);
            q.exec(function (err, doc) {
                if(err){
                    return cb(err);
                }
                var ary = doc[field];
                if(ary==undefined){
                    return cb(field+" doesn't exist");
                }
                if(Array.isArray(conditions)){
                    conditions.forEach(function(item){
                        item = obj.formatConditions(item);
                        doc[field].pull(item);
                    });
                }else{
                    conditions = obj.formatConditions(conditions);
                    if(_.isPlainObject(conditions)&&_.isEmpty(conditions)){
                        doc[field] = [];
                    }else{
                        doc[field].pull(conditions);
                    }
                }

                doc.save(function(err,ret){
                    if(err){
                        return cb(err);
                    }
                    cb(null,{ok:1});
                });
            });
        }

        ,create: function(id, data, cb){
            cb = cb||function(){};
            var q = model.findById(id);
            q.exec(function (err, doc) {
                if(err){
                    return cb(err);
                }
                var ary = doc[field];
                if(ary==undefined){
                    return cb(field+" doesn't exist");
                }
                if(!data){
                    return cb();
                }
                if(Array.isArray(data)){
                    doc[field] = doc[field].concat(data);
                }else{
                    try{
                        data = obj.formatConditions(data);
                        doc[field].push(data);
                    }catch(e){
                        return cb(e);
                    }
                }
                doc.save(function(err,ret){
                    if(err){
                        return cb(err);
                    }
                    cb(null,{ok:1});
                });
            });
        }

        ,update: function(id, conditions, data, cb){
            cb = cb||function(){};
            var q = model.findById(id);
            q.exec(function (err, doc) {
                if(err){
                    return cb(err);
                }
                var ary = doc[field];
                if(ary==undefined){
                    return cb(field+" doesn't exist");
                }
                conditions = obj.formatConditions(conditions);
                var multiple = _.where(ary, conditions);
                multiple.forEach(function(item){
                    if(_.isObject(item)&&_.isPlainObject(data)){
                        _.merge(item, data);
                    }
                });
                doc.save(function(err,ret){
                    if(err){
                        return cb(err);
                    }
                    cb(null,{ok:1});
                });
            });
        }
    };

    model[field] = obj;
    return model;
};
