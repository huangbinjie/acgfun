var controllers = require('../controller');
var auth = require('../util/auth');

module.exports = function (app) {
    app.post('/login', controllers.user.login);
    app.post('/register', controllers.user.register);
    app.post('/signout',auth.ensureAuthenticated,controllers.user.signOut);
//    app.get('/users', auth.ensureAuthenticated, controllers.user.list);
    app.post('/user', auth.ensureAuthenticated, controllers.user.get);
    app.post('/user/active',controllers.user.active);
    app.post('/user/reActive',controllers.user.reActive);
    app.post('/user/:uid',controllers.user.get);


    /*文章相关功能*/
    app.post('/[acgm]',controllers.post.list);
    app.put('/[acgm]',auth.ensureAuthenticated,controllers.post.put);
    app.post('/[acgm]/:pid/:title',controllers.post.getTopic);//获取文章
    app.put('/[acgm]/:pid/:title',auth.ensureAuthenticated,controllers.post.putComment);
    app.delete('/[acgm]/:pid/:title',auth.ensureAuthenticated,controllers.post.delete);

    /*收藏，关注*/
    app.put('/user/star',auth.ensureAuthenticated,controllers.user.star);
    app.put('/user/follow',auth.ensureAuthenticated,controllers.user.follow);
    app.post('/upload/face',auth.ensureAuthenticated,controllers.user.uploadFace);
}