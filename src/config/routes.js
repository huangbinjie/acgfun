var controllers = require('../controller');
var auth = require('../util/auth');

module.exports = function(app){
    app.get('/login',function(req,res){
        res.redirect('index.html#/login');
    })
    app.post('/login',controllers.user.login);
    app.get('/register',function(req,res){
        res.redirect('index.html#/register');
    })
    app.post('/register',controllers.user.register);

    app.get('/a',function(req,res){
        res.redirect('index.html#/a');
    })

    app.get('/users',auth.ensureAuthenticated,controllers.user.list);
    app.get('/user',auth.ensureAuthenticated,controllers.user.get);
    app.get('/user/:uid',auth.ensureAuthenticated,controllers.user.get);
}