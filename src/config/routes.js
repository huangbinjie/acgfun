var controllers = require('../controller');
var auth = require('../util/auth');

module.exports = function(app){
	app.get('/users',auth.ensureAuthenticated,controllers.user.list);
	app.get('/user',auth.ensureAuthenticated,controllers.user.get);
	app.get('/user/:uid',auth.ensureAuthenticated,controllers.user.get);
    app.post('/login',controllers.user.login);
    app.post('/register',controllers.user.register);
}