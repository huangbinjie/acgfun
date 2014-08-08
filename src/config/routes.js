var controllers = require('../controller');
var auth = require('../util/auth');

module.exports = function(app){

    app.get('/*',function(req,res){
        res.redirect("index.html#"+req.url);
    })

    app.post('/login',controllers.user.login);
    app.post('/register',controllers.user.register);
    app.get('/users',auth.ensureAuthenticated,controllers.user.list);
    app.get('/user',auth.ensureAuthenticated,controllers.user.get);
    app.get('/user/:uid',auth.ensureAuthenticated,controllers.user.get);
}