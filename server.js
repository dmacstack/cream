//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var bsync = require('async');

var socketio = require('socket.io');
var express = require('express');
var morgan = require('morgan');
var passport	= require('passport');
// server models
require('./server/models/chat.js');
require('./server/models/user.js');
////////

var router = express();
var server = http.createServer(router);
var mongoose = require('mongoose');
var io = socketio.listen(server);
var bodyParser = require('body-parser');
var jwt = require('jwt-simple');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));
router.use(express.static(path.join(__dirname + '/client')));
// log to console
router.use(morgan('dev'));
// Use the passport package in our application
router.use(passport.initialize());

// require('./server/config/sockets.js');


require('./server/config/mongoose.js');
var config = require('./server/config/database'); // get db config file
require('./server/config/routes.js')(router);


//setting the sockets
//the messages will be a way for the server to store the messaage information without using the database
var messages = [];
//sockets array will allow the server to store all the socket 
var sockets = [];
io.on('connection', function (socket) {
    //display all the messages when each user logs in
    messages.forEach(function (data) {
      socket.emit('message', data);
    });
    //puush each users sockets
    sockets.push(socket);

    socket.on('disconnect', function () {
      sockets.splice(sockets.indexOf(socket), 1);
      updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        if(err){console.log(err);}
        else{
          var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
        }
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        if(err){console.log(err)}
        else{updateRoster();}
      });
    });
  });
function updateRoster() {
  bsync.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      if(err){console.log(err);}
      else{broadcast('roster', names);}
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


