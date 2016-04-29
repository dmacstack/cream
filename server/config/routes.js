var users = require('./../controllers/usersController.js');
var chats = require('./../controllers/chatsController.js');

module.exports = function(router, passport, io){
    router.post('/login', function(req, res){
        users.findUser(req, res, io);
    });
    
    router.get('/chat', function(req, res){
	    chats.index(req, res);
    });      
    
    router.get('/success', function(req, res){
        res.send('success');
    });

    router.post('/chat', function(req, res){
        chats.create(req, res);
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/success', // redirect to the chat profile section
        failureRedirect : '/', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
};

/*// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}*/