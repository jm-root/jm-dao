var lib = require('./');
var db = lib.db;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schemaDefine = {
    title : {type: String},
    content:{type: String},
    isHtml:{type: Boolean, default: false},
    crtime: {type: Date},
    ext: Schema.Types.Mixed
};

var schema = new Schema(schemaDefine);

(function testDB(){
    //db1
    var dbUri = 'mongodb://localhost/test';
    var c = db.connect(dbUri, true);
    var c1= db.connect(dbUri, true);
    var c2= db.connect(dbUri, true);
    db.disConnect(dbUri);
    db.disConnect(dbUri);

    //db2 default DB
    db.connect();

    sd = lib.sequence();
    for(var i=0;i<5;i++)
        sd.next('uid2', {increase: 10}, function(err, v){
            console.info(v);
        });

    var dao = lib.dao(
        {
            modelName: 'product',
            schema: schema,
            tableName: 'p',
            prefix: 'test_'
        }
    );
    dao.create(
        {
            title: '测试文章标题',
            content: '测试文章内容'
        },
        function(err, doc){
            console.info(doc)
        }
    );

    dao.find2({page: 2, rows:3}, function(err, doc){
        console.info(doc);
    });

})();
