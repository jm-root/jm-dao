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
    ext: Schema.Types.Mixed
};

var schema = new Schema(schemaDefine);

let log = (err, doc) => {
    err && console.error(err.stack);
};

describe('db', function () {
    it('connect', function (done) {
        db.connect()
            .then(function (doc) {
                expect(doc).to.be.ok;
                done();
            }).catch(log)
    });

    it('connect cb', function (done) {
        db.connect(function (err, doc) {
            log(err, doc);
            expect(doc).to.be.ok;
            done();
        });
    });

    it('sequence cb', function (done) {
        db.connect().then(function (doc) {
            var sd = jm.sequence();
            sd.next('uid2', {increase: 10}, function (err, v) {
                expect(v > 1).to.be.ok;
                done();
            });
        });
    });

    it('sequence', function (done) {
        db.connect().then(function () {
            var sd = jm.sequence();
            sd.next('uid2', {increase: 10}).then(function (v) {
                expect(v > 1).to.be.ok;
                done();
            });
        });
    });

    it('dao', function (done) {
        db.connect().then(function () {
            var dao = jm.dao({
                modelName: 'product',
                schema: schema,
                tableName: 'p',
                prefix: 'test_'
            });
            dao.create(
                {
                    title: '测试文章标题',
                    content: '测试文章内容'
                }).then(function (doc) {
                expect(doc).to.be.ok;
                done();
            });
        });
    });

    it('find2 cb', function (done) {
        db.connect().then(function () {
            var dao = jm.dao({
                modelName: 'product',
                schema: schema,
                tableName: 'p',
                prefix: 'test_'
            });
            dao.find2({page: 1, rows: 3}, function (err, doc) {
                expect(doc).to.be.ok;
                done();
            });
        });
    });

    it('find2', function (done) {
        db.connect().then(function () {
            var dao = jm.dao({
                modelName: 'product',
                schema: schema,
                tableName: 'p',
                prefix: 'test_'
            });
            dao.find2({page: 1, rows: 3})
                .then(function (doc) {
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('find2 nopage', function (done) {
        db.connect().then(function () {
            var dao = jm.dao({
                modelName: 'product',
                schema: schema,
                tableName: 'p',
                prefix: 'test_'
            });
            dao.find2()
                .then(function (doc) {
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

    it('findOne2', function (done) {
        db.connect().then(function () {
            var dao = jm.dao({
                modelName: 'product',
                schema: schema,
                tableName: 'p',
                prefix: 'test_'
            });
            dao.findOne2()
                .then(function (doc) {
                    expect(doc).to.be.ok;
                    done();
                });
        });
    });

});
