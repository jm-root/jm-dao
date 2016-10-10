var jm = require('jm-core');
var express = require('express');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

module.exports = function(dao, opts) {
    var router = express.Router();

    jm.enableEvent(dao);

    opts = opts || {};
    opts.list = opts.list || {};
    opts.get = opts.get || {};
    opts.isObj = opts.isObj || true;

    var service = dao;
    dao.routes = dao.routes || {};
    var routes = dao.routes;

    var prefix = '/:pid/' + service.field;

    routes.done = function(req, res){
        var err = res.err;
        var doc = res.doc;
        if(err){
            console.error(err);
            res.send({err: err.code || 1, msg: err.msg || '操作失败'});
        }else{
            res.send(doc || {});
        }
    };

    routes.before_list = function(req, res, next){next();};
    routes.after_list = function(req, res, next){next();};
    routes.list = function(req, res, next){
        var id = req.params.pid;
        if(!ObjectId.isValid(id)){
            return next('route');
        }
        var conditions = req.conditions || opts.list.conditions || null;
        var population = req.population || opts.list.population || null;
        var page = req.query.page || req.body.page;
        var rows = req.query.rows || req.body.rows;
        var lean = opts.list.lean || true;
        service.find(id,{
            conditions: conditions
            ,population: population
            ,lean: lean
        }, function(err, doc){
            if(doc){
                var obj = {rows:doc};
                if(page || rows){
                    page = page || 1;
                    rows = rows || 10;
                    var start = (page-1)*rows;
                    var end = start + rows;
                    var arys = doc.slice(start,end);
                    obj.page = page;
                    obj.rows = arys;
                    obj.total = doc.length;
                    obj.pages = Math.ceil(doc.length / rows);
                }
                doc = obj;
            }
            res.err = err;
            res.doc = doc;
            next();
        });
    };

    routes.before_get = function(req, res, next){next();};
    routes.after_get = function(req, res, next){next();};
    routes.get = function(req, res, next){
        var id = req.params.pid;
        if(!ObjectId.isValid(id)||req.params.id&&!ObjectId.isValid(req.params.id)){
            return next('route');
        }
        var conditions = req.conditions || opts.get.conditions || {};
        var population = req.population || opts.get.population || null;
        var lean = opts.get.lean || true;
        if(opts.isObj) conditions._id = req.params.id
        service.findOne(id,{
            conditions: conditions
            ,population: population
            ,lean: lean
        },function(err, doc){
            res.err = err;
            res.doc = doc;
            next();
        });
    };

    routes.before_create = function(req, res, next){next();};
    routes.after_create = function(req, res, next){next();};
    routes.create = function(req, res, next) {
        var id = req.params.pid;
        if(!ObjectId.isValid(id)){
            return next('route');
        }
        var data = req.body;
        service.create(id, data, function(err, doc){
            res.err = err;
            res.doc = doc;
            next();
        });
    };

    routes.before_update = function(req, res, next){next();};
    routes.after_update = function(req, res, next){next();};
    routes.update = function(req, res, next){
        var id = req.params.pid;
        if(!ObjectId.isValid(id)||!ObjectId.isValid(req.params.id)){
            return next('route');
        }
        var data = req.body;
        service.update(id, req.params.id,data, function (err, doc) {
            res.err = err;
            res.doc = doc;
            next();
        });
    };

    routes.before_remove = function(req, res, next){next();};
    routes.after_remove = function(req, res, next){next();};
    routes.remove = function(req, res, next) {
        var id = req.params.pid;
        if(!ObjectId.isValid(id)||req.params.id&&!ObjectId.isValid(req.params.id)){
            return next('route');
        }
        var ids = req.params.id || req.query.id || req.body.id || [];
        if(ids instanceof Array){
        }else{
            ids = ids.split(',');
        }
        service.remove(id, ids, function(err, doc){
            res.err = err;
            res.doc = doc;
            next();
        });
    };

    var _done = function (req, res){routes.done(req, res);};

    var _before_list = function(req, res, next){routes.before_list(req, res, next);};
    var _after_list = function(req, res, next){routes.after_list(req, res, next);};
    var _list = function(req, res, next){routes.list(req, res, next);};

    var _before_get = function(req, res, next){routes.before_get(req, res, next);};
    var _after_get = function(req, res, next){routes.after_get(req, res, next);};
    var _get = function(req, res, next){routes.get(req, res, next);};

    var _before_create = function(req, res, next){routes.before_create(req, res, next);};
    var _after_create = function(req, res, next){routes.after_create(req, res, next);};
    var _create = function(req, res, next){routes.create(req, res, next);};

    var _before_update = function(req, res, next){routes.before_update(req, res, next);};
    var _after_update = function(req, res, next){routes.after_update(req, res, next);};
    var _update = function(req, res, next){routes.update(req, res, next);};

    var _before_remove = function(req, res, next){routes.before_remove(req, res, next);};
    var _after_remove = function(req, res, next){routes.after_remove(req, res, next);};
    var _remove = function(req, res, next){routes.remove(req, res, next);};

    router.get(prefix, _before_list, _list, _after_list, _done);
    router.post(prefix, _before_create, _create, _after_create, _done);
    router.delete(prefix, _before_remove, _remove, _after_remove, _done);

    if(opts.isObj){
        router.get(prefix+'/:id', _before_get, _get, _after_get, _done);
        router.post(prefix+'/:id', _before_update, _update, _after_update, _done);
        router.delete(prefix+'/:id', _before_remove, _remove, _after_remove, _done);
    }

    return router;
};
