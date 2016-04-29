var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');

module.exports = (function(){
	return {
		findUser: function(req, res, io){
			User.findOne({ 'local.email': req.body.user.email }, function(err, user){
				if (user === null) {
					console.log('User is not in the DB, or there was an error');
				}
				else {
					console.log(user)
					
						io.sockets.connected['/#'+req.body.socketID].username = user.local.name;
					// console.log('***********************************')
					// console.log(user.local.name);
					// console.log('/#'+req.body.socketID);
					// console.log(io.sockets.connected['/#'+req.body.socketID].username);
					// console.log('***********************************')
					res.json(user);
				}
			})
  		}
	}
})();

