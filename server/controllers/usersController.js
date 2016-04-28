var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');
var User = mongoose.model('User');


module.exports = (function(){
	return {
		findUser: function(req, res){
			User.findOne({ 'local.email': req.body.user.email }, function(err, user){
				if (err) {
					console.log('User is not in the DB, or there was an error');
				}
				else {
					res.json(user);
				}
			})
  		}
	}
})();

