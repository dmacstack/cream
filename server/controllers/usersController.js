var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');


module.exports = (function(){
	return {
			findUser: function(req, res){
			User.findOne({ name: req.body.name }, function(err, user){
				if (err) {
					console.log('User is not in the DB, or there was an error');
				} else {
					if (user){
						res.json(user);
						} else {
						User.create({name: req.body.name, password: req.body.password}, function(err, newUser){
							if (err) {
								console.log(err);
							} else {
								console.log(newUser);
								res.json(newUser);
						}
					})
				}
			}
		})
	  }
	}
})();

