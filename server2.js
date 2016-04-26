//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');

var async = require('async');
var socketio = require('socket.io');
var express = require('express');
// var morgan = require('morgan');
// var passport	= require('passport');

//
// ## SimpleServer `SimpleServer(obj)`
//
// Creates a new instance of SimpleServer with the following options:
//  * `port` - The HTTP port to listen on. If `process.env.PORT` is set, _it overrides this value_.
//
var router = express();
var server = http.createServer(router);
var mongoose = require('mongoose');
var io = socketio.listen(server);
var bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(express.static(path.join(__dirname + '/client')));

// server models
// require('./server/models/chat.js');
// require('./server/models/user.js');
////////

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
  async.map(
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


