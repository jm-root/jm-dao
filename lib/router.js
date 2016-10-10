var jm = require('jm-core');
var express = require('express');
var mongoose = require('mongoose');
var _ = require('lodash');
var ObjectId = mongoose.Types.ObjectId;

module.exports = function(dao, opts) {
    var router = express.Router(opts);

    jm.enableEvent(dao);

    opts = opts || {};
    opts.list = opts.list || {};
    opts.get = opts.get || {};

    dao.routes = dao.routes || {};
    var routes = dao.routes;

    routes.opts = opts;

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
        dao.emit('before_list', req, res);
        var optsList = _.cloneDeep(opts.list);
        var populations = req.populations || optsList.populations || null;
        var page = req.query.page || req.body.page;
        var rows = req.query.rows || req.body.rows;
        var conditions = req.conditions || optsList.conditions || null;
        var options = req.options || optsList.options || {};
        var fields = req.fields || optsList.fields || null;
        var sidx = req.query.sidx || req.body.sidx;
        var sord = req.query.sord || req.body.sord;
        var lean = true;
        if(req.lean === false){
            lean = false;
        }else if(optsList.lean === false){
            lean = false;
        }
        if(sidx){
            options.sort = [];
            var o = {};
            o[sidx] = -1;
            if(sord == 'asc'){
                o[sidx] = 1;
            }
            options.sort.push(o);
        }

        dao.find2({
            populations: populations,
            conditions: conditions,
            fields: fields,
            options: options,
            lean: lean,
            page: page,
            rows: rows
        },function (err, doc) {
            res.err = err;
            if(page || rows) {
                res.doc = doc;
            }else{
                res.doc = {rows: doc};
            }
            dao.emit('list', req, res);
            next();
        });
    };

    routes.before_get = function(req, res, next){next();};
    routes.after_get = function(req, res, next){next();};
    routes.get = function(req, res, next){
        dao.emit('before_get', req, res);
        var id = req.params.id;
        if(!ObjectId.isValid(id)){
            return next('route');
        }
        var optsGet = _.cloneDeep(opts.get);
        var populations = req.populations || optsGet.populations || null;
        var options = req.options || optsGet.options || {};
        var fields = req.fields || optsGet.fields || null;
        var lean = true;
        if(req.lean === false){
            lean = false;
        }else if(optsGet.lean === false){
            lean = false;
        }
        dao.findById2(
            id,
            {
                populations: populations,
                fields: fields,
                options: options,
                lean: lean
            },
            function (err, doc) {
                res.err = err;
                res.doc = doc;
                dao.emit('get', req, res);
                next();
            }
        );
    };

    routes.before_create = function(req, res, next){next();};
    routes.after_create = function(req, res, next){next();};
    routes.create = function(req, res, next){
        dao.emit('before_create', req, res);
        var data = req.body;
        dao.create(data, function (err, doc) {
            res.err = err;
            res.doc = doc;
            dao.emit('create', req, res);
            next();
        });
    };

    routes.before_update = function(req, res, next){next();};
    routes.after_update = function(req, res, next){next();};
    routes.update = function(req, res, next){
        dao.emit('before_update', req, res);
        var id = req.params.id;
        if(!ObjectId.isValid(id)){
            return next('route');
        }
        var data = req.body;
        dao.update({_id:id}, data, function (err, doc) {
            res.err = err;
            res.doc = doc;
            dao.emit('update', req, res);
            next();
        });
    };

    routes.before_remove = function(req, res, next){next();};
    routes.after_remove = function(req, res, next){next();};
    routes.remove = function(req, res, next){
        dao.emit('before_remove', req, res);
        if(req.params.id&&!ObjectId.isValid(req.params.id )){
            return next('route');
        }
        var id = req.params.id || req.query.id || req.body.id;
        if(id instanceof Array){
        }else{
            id = id.split(',');
        }
        dao.remove({ _id: { $in: id }}, function (err, doc) {
            res.err = err;
            if(!err){
                doc = doc.result;
            }
            res.doc = doc;
            dao.emit('remove', req, res);
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

    var cfg = jm.root.registries.router || {};
    if(cfg.enable_router_save){
        var _before_save = function(req, res, next){
            var data = req.body;
            if(data._id){
                req.params.id = data._id;
                delete data['_id'];
                routes.before_update(req, res, next);
            }else{
                routes.before_create(req, res, next);
            }
        };
        var _after_save = function(req, res, next){
            if(req.params.id){
                routes.after_update(req, res, next);
            }else{
                routes.after_create(req, res, next);
            }
        };
        var _save = function(req, res, next){
            if(req.params.id){
                routes.update(req, res, next);
            }else{
                routes.create(req, res, next);
            }
        };
        router.post('/save', _before_save, _save, _after_save, _done);
    }
    
    router.get('', _before_list, _list, _after_list, _done);
    router.post('', _before_create, _create, _after_create, _done);
    router.delete('', _before_remove, _remove, _after_remove, _done);

    router.get('/:id', _before_get, _get, _after_get, _done);
    router.post('/:id', _before_update, _update, _after_update, _done);
    router.delete('/:id', _before_remove, _remove, _after_remove, _done);

    return router;
};


