//
// # SimpleServer
//
// A simple chat server using Socket.IO, Express, and Async.
//
var http = require('http');
var path = require('path');
var port = process.env.PORT || 3000 || "0.0.0.0";
var async = require('async');
var socketio = require('socket.io');
var express = require('express');
// var morgan = require('morgan');
var passport	= require('passport');

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
var flash    = require('connect-flash');
var session      = require('express-session');

router.use(bodyParser.json());
router.use(express.static(path.join(__dirname + '/client')));

// required for passport
router.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
router.use(passport.initialize());
router.use(passport.session()); // persistent login sessions
router.use(flash()); // use connect-flash for flash messages stored in session
// server models
// require('./server/models/chat.js');
// require('./server/models/user.js');
require('./server/config/mongoose.js');
////////

// require('./server/config/sockets.js');

// var configDB = require('./server/config/database.js');

// // configuration ===============================================================
// mongoose.connect(configDB.url); // connect to our database

require('./server/config/passport.js')(passport); // pass passport for configuration
require('./server/config/routes.js')(router, passport, io);

//setting the sockets
//the messages will be a way for the server to store the messaage information without using the database
var messages = [];
io.on('connection', function (socket) {
    //display all the messages when each user logs in
    console.log("socket connected with ", socket.id);
    var username;
    var room;
    messages.forEach(function (data) {
      io.sockets.in(room).emit('message', data);
    });

    function temp(clients) {
      console.log('inside temp function');
      io.sockets.in(room).emit('userList', {clients: clients
      });
    }

    socket.on('room', function(roomName){
      socket.join(roomName);
      room = roomName;
      // console.log(io.sockets.adapter.rooms[roomName]);
      //this gets all the socket ids in array from that is in a room
      var arrClients = (Object.keys(io.sockets.adapter.rooms[roomName].sockets));
      console.log(arrClients);
      //console.log(io.sockets.clients(roomName));
      var clients = [];
      //this loop gets the name of the user of all the sockets connected to the room
      for(var i=0; i<arrClients.length;i++){
        clients.push(io.sockets.connected[arrClients[i]].username);
      }
      temp(clients);
      console.log(clients);

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

server.listen(port, function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});