var users = require('./../controllers/usersController.js');
var chats = require('./../controllers/chatsController.js');

module.exports = function(router){


    router.post('/user', function(req, res){
        console.log(req.body);
        users.findUser(req, res);
    });
    
        router.get('/chat', function(req, res){
        chats.index(req, res);
    });      
    
    router.post('/chat', function(req, res){
        chats.create(req, res);
    });
};