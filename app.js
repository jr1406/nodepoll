var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var poll = require('./routes/poll');
var connect = require('./routes/connect');

var mongodb = require("mongodb");
var  assert = require("assert");
var MongoClient = mongodb.MongoClient;
var url = 'mongodb://14.32.66.127:27017/polls';

var app = express();

app.io = require('socket.io')();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
var hbs = require("hbs");
hbs.registerHelper("Date",function(timeValue){
  var dateObj = new Date(timeValue);
  var year = dateObj.getFullYear();
  var month  = dateObj.getMonth()+1;
  var date = dateObj.getDate();
  var time = dateObj.getHours();
  var min =dateObj.getMinutes();
  return year+"/"+month+"/"+date+"  "+time+":"+min;

});


hbs.registerHelper("stat", function (status) {
  var check = status;
  if(check == "activate"){
    return "checked";
  }else{
    return "";
  }
});

hbs.registerHelper('check', function (options) {

  var answer = options;
  var list = ["answer1","answer2","answer3","answer4"];
  var list2 = ["선다형","찬반형","단답형","서술형"];
  for(var i=0;i<4;i++){
    if(answer == list[i]){
      return list2[i];
    }
  }

});


hbs.registerHelper('check2', function (options) {

  var public = options;

  if(public == "public1"){
    return "공개";
  }else{
    return "비공개";
  }

});

hbs.registerHelper('image', function (options) {

  var image = options;

  console.log("c:\\zzz\\upload"+image);
  return "c:\\zzz\\upload"+image;
});


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/poll', poll);
app.use('/connect', connect);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.io.on('connection', function (socket) {
  console.log('a user connected');
  //console.log(app.io.)

  socket.on('client Check', function (data) {
    var pno = data.pno;
    var clientCheck = data.clientCheck;


    console.log("클라이언트"+clientCheck);
    MongoClient.connect(url, function(err, db){

      //var selected = parseInt(clientCheck[0]);

      //console.log(selected + typeof(selected));
      console.log(clientCheck[0]);
      console.log(clientCheck[1]);

      for(var i=0; i<clientCheck.length; i++){
        db.collection("pollresult").update({"pno":pno, "texts.No":parseInt(clientCheck[i])}, {$inc: {"texts.$.Count":1}}, function () {
          console.log("SUCCESS");
          console.log(clientCheck[i]); // 이것이 언디파인드되고있습니다.
        });
      }
      app.io.emit("resultChange");
      db.close();
    });

  });

  socket.on('make result', function(data){

    console.log(data);
    //console.log(data.pno);
    var pno = Number(data);



    MongoClient.connect(url, function (err, db) {
      var txtArr = [];
      var resultText= {
        pno : pno,
        topic : "",
        texts : []
      };
      console.log("first, we find poll's texts");

      db.collection("polls").findOne({pno:pno}, function (err, result) {
        //console.log("you found");
        //console.log(result.texts);

        //resultText = result.texts;

        for(var i=0; i<result.texts.length; i++){
          var a = {
            Item : result.texts[i].selectItem,
            No : result.texts[i].pnoItemNo,
            Count : 0
          };

          txtArr.push(a);

        }
        resultText.topic = result.topic;
        resultText.texts = txtArr;

        console.log("결과!"+resultText.topic);

        db.collection("pollresult").insert(resultText, function () {
          console.log("done");
        });
        db.close();
      });
    });

  });//socket event

  socket.on('status control', function (status) {
    console.log(status);
    var pno = 1201;

    var updateStatus = function (db, callback) {

      console.log("callback~~~~~~~~~~~~");

      db.collection("polls").updateOne({"pno": pno}, {$set: {status:status}},
          function (err, results) {
            if(err) {
              throw err;
            }
            // console.log(results);
            callback();
          });
    };

    MongoClient.connect(url, function (err, db) {

      assert.equal(null, err);

      console.log("client~~~~~~~~~~~~");

      updateStatus(db, function () {

        console.log("updateStatus");

        db.close();

        console.log("db.close");
      });
    });

  });
});

module.exports = app;