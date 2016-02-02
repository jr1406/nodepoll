var express = require('express');
var router = express.Router();
var mongodb = require("mongodb");
var  assert = require("assert");
var ObjectId = require("mongodb").ObjectID;
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://14.32.66.127:27017/polls';
var request = require("request");
var fs = require("fs");
var mnotest;


router.get('/user/:mno', function (req, res, next) {
  var mno = req.params.mno;
  mno = Number(mno);
  console.log("엠엔"+mno);


  var findNode = function(db,callback){

    var cursor = db.collection("polls").find({mno:mno}).sort({pno:-1});
    var resultArr = [];
    cursor.toArray(function (err, result) {
      var i, count;

      for(i=0, count = result.length; i< count; i++){
        resultArr.push(result[i]);
      }

      callback(resultArr);
    });
  };

  MongoClient.connect(url,function(err,db){


    assert.equal(null,err);
    findNode(db,function(data){
      db.close();
      res.render('main', {mnos:data});
    });

  });

});

router.get("/result/:pno",function(req,res,next){
  console.log("result Get page !");

  var pno = parseInt(req.params.pno);

  MongoClient.connect(url, function (err, db) {
    //console.log("gogo!!");
    db.collection("pollresult").findOne({pno:pno}, function (err, result) {
      //console.log(result);
      res.render("result",result);
    });
  });

});

router.post("/result/:pno",function(req,res,next){
  console.log("result Post page !!!");

  var pno = parseInt(req.params.pno);
  console.log(pno);

  console.log('현재쿠키 '+req.cookies.hasVisited);
  var getCookie = req.param("cookieData");
  console.log('받은쿠키'+getCookie);

  var visitedPno = String(getCookie);
  var finalVisited = visitedPno+pno;


  if(visitedPno==''){
    //이 유저가 한번도 투표에 참여하지 않은 경우 ( 쿠키가 없을 경우 ) ' pno: ' 이형식을 넣어줌
    console.log("쿠키비어서 여기옴");
    res.cookie('hasVisited', pno+':',{
      maxAge : 24 * 60 * 60 * 1000,
      httpOnly : false,
      path : '/poll/'
    });
  }else{
    //이 유저가 한번이라도 쿠키를 발급 받은 경우. 여태 받았던 것에 pno를 추가로 더한 변수를 넣는다.
    console.log("쿠키길이 있음");
    res.cookie('hasVisited', finalVisited+':', {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: false,
      path: '/poll/'
    });
  };


  MongoClient.connect(url, function (err, db) {
    //console.log("gogo!!");
    db.collection("pollresult").findOne({pno:pno}, function (err, result) {
      //console.log(result);
      res.render("result",result);
    });
  });
});


router.get('/imgs/:year/:month/:day/:fileName',function(req,res){

  var year = req.params.year;
  var month = req.params.month;
  var day = req.params.day;
  var fileName = req.params.fileName;

  var fullName = "C:\\zzz\\upload\\"+year+"\\"+month+"\\"+day+"\\"+fileName;

  fs.readFile(fullName,function(error,data){
    res.writeHead(200, { 'Content-Type': 'text/html'});
    res.end(data);
  });
});

module.exports = router;