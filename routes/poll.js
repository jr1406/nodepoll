var express = require('express');
var router = express.Router();
var mongodb = require("mongodb");
var  assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://14.32.66.127:27017/polls';
var request = require("request");
router.get("/:pno",function(req,res,next){

  console.log("find~~~~~~");


  var pno = req.params.pno;
  pno=Number(pno);
  console.log("pno 는 "+pno);
  var visited;
  var cookArr;
  var cookieData='';

  console.log("쿠키가 있긴있는지"+req.cookies.hasVisited);

  //아예 쌩 처음와서 투표조차 한적이없다.
  if( typeof (req.cookies.hasVisited) == 'undefined' ){
    console.log("언디파인드네?");
    visited = false;
  }
  //투표를 최소 한번은 했다.
  else{
    //쿠키를 파싱해서 pno 하나하나를 비교해
    cookieData = String(req.cookies.hasVisited);
    //cookArr = cookieData.split(':');


    //cookArr.pop();
    //console.log("쿠키에알알"+cookArr+typeof (cookArr));
    //cookArr = Number(cookArr);
    console.log("쿠키데이타 "+cookieData);

    //이 사람이 현재 이 투표에 온적이있는지 없는지 확인한다.
    if(cookieData.indexOf(pno) != -1){
      visited = true;
    }else{
      visited = false;
    }
    //  for(var i=0; i<cookArr.length; i++){
    //
    //    if( cookArr[i] == pno ){
    //      visited = true;
    //      break;
    //    }else{
    //      visited = false;
    //    }
    //  };
  }


  //if(visited == true){
  //  console.log('현재쿠키 '+req.cookies.hasVisited);
  //
  //  var visitedPno = String(req.cookies.hasVisited);
  //  var finalVisited = visitedPno+pno;
  //
  //  //이 유저가 이 페이지를 온적이 있으니까 이자리에서 쿠키를 집어넣어버린다.
  //  res.cookie('hasVisited', finalVisited, {
  //    maxAge: 24 * 60 * 60 * 1000,
  //    httpOnly: false,
  //    path: '/poll/'
  //  });
  //  console.log('바뀐쿡키'+req.cookies.hasVisited);
  //}



  console.log("visited 는 "+visited+" 타입은 "+typeof (visited));

  var findNode = function(db,callback){
    console.log("callback~~~~~~~");

    var cursor = db.collection("polls").find({pno:pno});

    cursor.next(function(err,doc){

      assert.equal(err,null);

      if(doc != null){

        var data = doc;
        data.visited = visited;
        data.cookieData = cookieData;
        console.log("차례대로 제목 방문한적 쿠키값");
        console.log(data.topic);
        console.log(data.visited);
        console.log(data.cookieData);
        res.render("pollview",data);

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

router.post("/active",function(req,res,next){

  console.log("active post......");

  var pno = parseInt(req.body.pno);
  var srturl = req.body.srturl;

  console.log("pno: " + pno);
  console.log("req.body.status: " + req.body.status);
  console.log("srturl: " + req.body.srturl);

  MongoClient.connect(url, function (err, db) {

    assert.equal(null, err);

    console.log("client~~~~~~~~~~~~");

    updateStatus(db, function () {

      console.log("updateStatus");

      db.close();

      console.log("db.close");
    });
  });

  var updateStatus = function (db, callback) {

    db.collection("polls").updateOne({"pno": pno}, {$set: {status:req.body.status, srturl:req.body.srturl}},

        function (err, results) {
          if(err) {
            Console.log("Error update..... " );
            throw err;
          }
          console.log("update result: "+results);
          callback();
        });
  };

  res.send("");
});

module.exports = router;
