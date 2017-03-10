var lib = require('./');
var DB = lib.DB;
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
    var c = DB.connect(dbUri, true);
    var c1= DB.connect(dbUri, true);
    var c2= DB.connect(dbUri, true);
    DB.disConnect(dbUri);
    DB.disConnect(dbUri);

    //db2 default DB
    DB.connect();

    sd = lib.sequence();
    for(var i=0;i<5;i++)
        sd.next('uid2', {increase: 10}, function(err, v){
            console.info(v);
        });

    var dao = lib.dao(
        {
            modelName: 'product',
            schema: schema
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
