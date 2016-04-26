var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');

module.exports = (function(){
    return {
        index: function(req, res){
            Chat.find({}, function(err, chats){
                if (err){
                    console.log('Error, retrieving chats', err);
                } else {
                    console.log('Success! retrieved chats!', chats);
                }
            })
        },
        create: function(req, res){
            Chat.create(req.body, function(err, chat){
                if(err){
                    console.log('There was an error!', err);
                } else {
                    console.log('Chat succesfully created!!!!');
                }
            })
        }
    }
})