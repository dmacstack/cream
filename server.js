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


//setting the sockets
//the messages will be a way for the server to store the messaage information without using the database
var messages = [];
io.on('connection', function (socket) {
    //display all the messages when each user logs in
    var username;
    var room;
    messages.forEach(function (data) {
      socket.emit('message', data);
    });
    socket.on('room', function(roomName){
      socket.join(roomName);
      // console.log(io.sockets.adapter.rooms[roomName]);
      //this gets all the socket ids in array from that is in a room
      var arrClients = (Object.keys(io.sockets.adapter.rooms[roomName].sockets));
      console.log(arrClients);
      //console.log(io.sockets.clients(roomName));
      var clients = [];
      //this loop gets the name of the user of all the sockets connected to the room
      for(var i=0; i<arrClients.length;i++){
        clients.push(io.sockets.connected[arrClients[i]].username.name);
      }
      console.log(clients);
      io.sockets.in(roomName).emit('userList', {clients: clients});
      room = roomName;
    })
    
    socket.on('leaveRoom', function(data){
      socket.leave(room);
    });
    
    socket.on('disconnect', function () {
      
    });
    
    socket.on('alive_user', function(userName){
      io.sockets.emit('update_list', userName);
      socket.username = userName;
    })
    
    socket.emit('obtain_rooms', function(){
      
    })
    
    

  });

require('./server/config/mongoose.js');
require('./server/config/routes.js')(router);

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});


