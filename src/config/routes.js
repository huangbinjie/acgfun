var controllers = require('../controller');
var auth = require('../util/auth');

module.exports = function (app) {
    app.post('/login', controllers.user.login);
    app.post('/register', controllers.user.register);
    app.post('/signout',auth.ensureAuthenticated,controllers.user.signOut);
    app.post('/user', auth.ensureAuthenticated, controllers.user.get);
    app.post('/user/active',controllers.user.active);
    app.post('/user/reActive',controllers.user.reActive);
    /*个人属性*/
    app.post('/user/profile',auth.ensureAuthenticated,controllers.user.getProfile);
    app.put('/user/profile',auth.ensureAuthenticated,controllers.user.setProfile)
    /*文章管理*/
    app.post('/user/topic',auth.ensureAuthenticated,controllers.user.topicManage)
    /*评论管理*/
    app.post('/user/comment',auth.ensureAuthenticated,controllers.user.commentManage)
    /*回复管理*/
    app.post('/user/reply',auth.ensureAuthenticated,controllers.user.replyManage)

    /*重置密码*/
    app.post('/user/resetPass',auth.ensureAuthenticated,controllers.user.resetPass);
    app.post('/user/forgotPass',controllers.user.forgotPass);

    /*收藏，关注*/
    app.put('/user/star',auth.ensureAuthenticated,controllers.user.star);
    app.put('/user/follow',auth.ensureAuthenticated,controllers.user.follow);
    app.post('/user/follow',auth.ensureAuthenticated,controllers.user.followed);
    app.delete('/user/follow',auth.ensureAuthenticated,controllers.user.unfollow);
    /*用户个人中心*/
    app.post('/user/:uid',controllers.user.get);

    /*文章相关功能*/
    app.post('/[acgm]',controllers.post.list);
    app.put('/[acgm]',auth.ensureAuthenticated,controllers.post.put);
    app.post('/[acgm]/:pid/:title',controllers.post.getTopic);//获取文章
    app.put('/[acgm]/:pid/:title',auth.ensureAuthenticated,controllers.post.putComment);
    app.delete('/[acgm]/:pid/:title',auth.ensureAuthenticated,controllers.post.delete);

    app.post('/upload/face',auth.ensureAuthenticated,controllers.user.uploadFace);

    /*主页*/
    app.post('/home',controllers.home.main);
    app.post('/home/recent',controllers.home.recent);
    app.post('/home/status',controllers.home.status);
    app.post('/home/active',controllers.home.active);
}