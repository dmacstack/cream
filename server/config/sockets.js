var http = require('http');
var express = require('express');
var router = express();
var async = require('async');
var server = http.createServer(router);
var socketio = require('socket.io');
var io = socketio.listen(server); 
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
    //push each users sockets
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