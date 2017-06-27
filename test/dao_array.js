var chai = require('chai');
let expect = chai.expect;
var jm = require('../lib');
var db = jm.db;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaDefine = {
    title: {type: String},
    content: {type: String},
    isHtml: {type: Boolean, default: false},
    crtime: {type: Date},
    topics: [{type: String}]
};

var schema = new Schema(schemaDefine);

let log = (err, doc) => {
    err && console.error(err.stack);
};

let init = function () {
    return db.connect()
        .then(function () {
            var dao = jm.dao({
                modelName: 'product2',
                schema: schema
            });
            return dao;
        });
};

let bind = function () {
    return db.connect()
        .then(function () {
            var dao = jm.dao({
                modelName: 'product2',
                schema: schema
            });
            dao.bindArrayField({field: 'topics'});
            return dao;
        })
        ;
};

describe('dao_array', function () {

    it('create', function (done) {
        init().then(function (dao) {
            dao.create(
                {
                    title: '测试文章标题',
                    content: '测试文章内容',
                    topics: ['t1', 't2']
                }).then(function (doc) {
                expect(doc).to.be.ok;
                done();
            });
        });
    });

    it('findOne', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.findOne(doc.id);
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('find', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.find(doc.id, {conditions:'t2'});
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('remove', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.remove(doc.id, 't2');
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('create', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.create(doc.id, 't3');
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('create array', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.create(doc.id, ['t4', 't5']);
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('update', function (done) {
        bind().then(function (dao) {
            dao.findOne()
                .then(function (doc) {
                    return dao.topics.update(doc.id, 't1', 't9');
                })
                .then(function (doc) {
                    console.log(doc);
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });
});
