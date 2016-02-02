var express = require('express');
var router = express.Router();
var mongodb = require("mongodb");
var  assert = require("assert");
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://14.32.66.127:27017/polls';
var request = require("request");

router.get("/call/:pno",function(req,res,next){

    var pno = req.params.pno;
    console.log("pno: "+pno);

    request("http://localhost:8081/poll/create/"+pno, function(error, response, pollJSON) {

        var pollData = JSON.parse(pollJSON);

        console.log("insert in~~");
        var insertDocument = function (db, callback) {
            console.log("incallback~~~");

            db.collection("polls").insertOne(pollData, function (err, result) {
                assert.equal(err, null);
                console.log("insert document~~~~~~!");
                callback(result);
            });
        };

        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            insertDocument(db, function () {
                db.close();
            });
        });
    });
    res.send("");
});
// 업데이트 미완성
router.get("/update/:pno",function(req,res,next){

    console.log("update~~~~~~~~~~~~");
    var pno = req.params.pno;
    console.log("pno: "+pno);
    request("http://localhost:8081/poll/modify/"+pno, function(error, response, pollJSON) {

        pno=Number(pno);
        console.log(typeof(pno));
        console.log(pollJSON);
        var updateNode = function (db, callback) {
            console.log("callback~~~~~~~~~~~~");
            db.collection("polls").updateMany(
                {"pno": pno},
                {
                    $set: JSON.parse(pollJSON)
                }, function (err, results) {
                    console.log(results);
                    callback();
                });
        };

        MongoClient.connect(url, function (err, db) {
            assert.equal(null, err);
            console.log("client~~~~~~~~~~~~");
            updateNode(db, function () {
                db.close();
            });
        });
    });
    res.send("");
});

// 삭제 미완성
router.get("/remove/:pno",function(req,res,next){
    var pno = req.params.pno;
    console.log("delete: "+pno);
    var removeNode = function(db,callback){

        pno=Number(pno);
        console.log(typeof(pno));
        console.log("remove~~~~~~~~~~~~~~~~~"+pno);
        db.collection("polls").deleteOne(
            {"pno":pno},
            function(err,results){
                console.log(results);
                console.log(pno);
                callback();
            }
        );
    };

    MongoClient.connect(url,function(err,db){
        assert.equal(null,err);
        removeNode(db,function(){
            db.close();
        });
    });
    res.send("");
});


router.get("/getVal/:pno",function(req,res,next){

    console.log("getVal~~~~~~");
    var pno = req.params.pno;
    pno=Number(pno);
    console.log(pno);

    var findNode = function(db,callback){
        console.log("callback~~~~~~~");
        var cursor = db.collection("polls").find({pno:pno});
        cursor.next(function(err,doc){

            assert.equal(err,null);

            if(doc !=null){
                console.log(doc);
                var data = doc;
                console.log("data: "+data.validation);
                res.send("main",{data:data.validation,topic:data.topic});
            }else{
                callback();
            }

        });
    };

    MongoClient.connect(url,function(err,db){
        console.log("client~~~~");
        assert.equal(null,err);
        findNode(db,function(){
            db.close();
        });


    });

});


router.get("/getResult/:pno",function(req,res,next){

    console.log("getResult~~~~~~");
    var pno = req.params.pno;
    pno=Number(pno);
    console.log(pno);

    var findResult = function(db,callback){
        console.log("callback~~~~~~~");
        var cursor = db.collection("pollresult").find({pno:pno});
        cursor.next(function(err,doc){

            assert.equal(err,null);

            if(doc !=null){
                console.log(doc);
                console.log(doc.texts);
                res.send("result",{multi:doc.texts})
            }else{
                callback();
            }

        });
    };

    MongoClient.connect(url,function(err,db){
        console.log("client~~~~");
        assert.equal(null,err);
        findResult(db,function(){
            db.close();
        });


    });

});

module.exports = router;