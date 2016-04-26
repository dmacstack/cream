var users = require('./../controllers/usersController.js');
var chats = require('./../controllers/chatsController.js');

module.exports = function(router){
    router.post('/user', function(req, res){
        users.findUser(req, res);
    });
    
    router.get('/chat', function(req, res){
        chats.index(req, res);
    });
    router.post('/chat', function(req, res){
        chats.create(req, res);
    });
    // demo Route (GET http://localhost:8080)
    router.get('/test', function(req, res) {
      res.send('Hello! The API is at http://localhost:3000/test');
    });
};