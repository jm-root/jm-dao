var _ = require('lodash');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var ObjectId = mongoose.Types.ObjectId;

module.exports = function (dao, opts) {
    var field = opts.field;

    var model = dao;

    var obj = {
        field: field,

        formatConditions: function (conditions) {
            if (_.isPlainObject(conditions)) {
                var _id = conditions._id;
                if (_id) conditions._id = ObjectId.isValid(_id) && new ObjectId(_id) || _id;
                var id = conditions.id;
                if (id) conditions.id = ObjectId.isValid(id) && new ObjectId(id) || id;
                var $ = conditions.$;
                if ($) conditions = conditions.$;
            } else {
                conditions = ObjectId.isValid(conditions) && new ObjectId(conditions) || conditions;
            }
            return conditions;
        },

        findOne: function (id, opts, cb) {
            if (cb) {
                this.findOne(id, opts)
                    .then(function (doc) {
                        cb(null, dos);
                    })
                    .then(cb)
                ;
                return this;
            }
            opts = opts || {};
            var conditions = opts.conditions || {};
            var population = opts.population || false;
            if (population) {
                if (typeof population === 'boolean' || !_.isPlainObject(population)) population = {};
                population.path = field;
            }

            var q = model.findById(id);
            if (population) {
                q.populate(population);
            }
            if (opts.lean) q.lean();
            return q.exec()
                .then(function (doc) {
                    var ary = doc[field];
                    if (ary == undefined) {
                        throw new Error(field + ' not exist');
                    }
                    conditions = obj.formatConditions(conditions);
                    var one;
                    if (_.isPlainObject(conditions)) {
                        one = _.find(ary, conditions) || null;
                    } else {
                        var pos = _.indexOf(ary, conditions);
                        one = pos != -1 ? ary[pos] : null;
                    }
                    return one;
                });
        },

        find: function (id, opts, cb) {
            if (cb) {
                this.find(id, opts)
                    .then(function (doc) {
                        cb(null, dos);
                    })
                    .then(cb)
                ;
                return this;
            }

            opts = opts || {};
            var conditions = opts.conditions || {};
            var population = opts.population || false;
            if (population) {
                if (typeof population === 'boolean' || !_.isPlainObject(population)) population = {};
                population.path = field;
            }

            var q = model.findById(id);
            if (population) {
                q.populate(population);
            }
            if (opts.lean) q.lean();
            return q.exec()
                .then(function (doc) {
                    var ary = doc[field];
                    if (ary == undefined) {
                        throw new Error(field + ' not exist');
                    }
                    var multiple = null;
                    if (_.isPlainObject(conditions) && _.isEmpty(conditions)) {
                        multiple = ary;
                    } else {
                        conditions = obj.formatConditions(conditions);
                        multiple = _.filter(ary, conditions) || null;
                    }
                    return multiple;
                });
        },

        remove: function (id, conditions, cb) {
            if (cb) {
                this.remove(id, conditions)
                    .then(function (doc) {
                        cb(null, dos);
                    })
                    .then(cb)
                ;
                return this;
            }

            conditions = conditions || {};
            var q = model.findById(id);
            return q.exec()
                .then(function (doc) {
                    var ary = doc[field];
                    if (ary == undefined) {
                        throw new Error(field + ' not exist');
                    }
                    if (Array.isArray(conditions)) {
                        conditions.forEach(function (item) {
                            item = obj.formatConditions(item);
                            doc[field].pull(item);
                        });
                    } else {
                        conditions = obj.formatConditions(conditions);
                        if (_.isPlainObject(conditions) && _.isEmpty(conditions)) {
                            doc[field] = [];
                        } else {
                            doc[field].pull(conditions);
                        }
                    }

                    return doc.save();
                });
        },

        create: function (id, data, cb) {
            if (cb) {
                this.create(id, data)
                    .then(function (doc) {
                        cb(null, dos);
                    })
                    .then(cb)
                ;
                return this;
            }

            var q = model.findById(id);
            return q.exec()
                .then(function (doc) {
                    var ary = doc[field];
                    if (ary == undefined) {
                        throw new Error(field + ' not exist');
                    }
                    if (!data) {
                        throw new Error('invalid data');
                    }
                    if (Array.isArray(data)) {
                        doc[field] = doc[field].concat(data);
                    } else {
                        data = obj.formatConditions(data);
                        doc[field].push(data);
                    }
                    return doc.save();
                });
        },

        update: function (id, conditions, data, cb) {
            if (cb) {
                this.update(id, conditions, data)
                    .then(function (doc) {
                        cb(null, dos);
                    })
                    .then(cb)
                ;
                return this;
            }

            var q = model.findById(id);
            return q.exec()
                .then(function (doc) {
                    var ary = doc[field];
                    if (ary == undefined) {
                        throw new Error(field + ' not exist');
                    }
                    conditions = obj.formatConditions(conditions);
                    var multiple = _.filter(ary, conditions);
                    multiple.forEach(function (item) {
                        if (_.isObject(item) && _.isPlainObject(data)) {
                            _.merge(item, data);
                        }
                    });
                    return doc.save();
                });
        },
    };

    model[field] = obj;
    return model;
};
