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
require('./server/models/chat.js');
require('./server/models/user.js');
////////

// require('./server/config/sockets.js');

var configDB = require('./server/config/database.js');

// configuration ===============================================================
mongoose.connect(configDB.url); // connect to our database

require('./server/config/passport')(passport); // pass passport for configuration
require('./server/config/routes.js')(router, passport);

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

server.listen(port, function(){
  var addr = server.address();
  console.log("Chat server listening at", addr.address + ":" + addr.port);
});