var User = require('../database/user_model');
var Post = require('../database/post_model');
var Team = require('../database/team_model');
var Comment = require('../database/comment_model');
var async = require('async');
var MD5 = require('MD5');
var fs = require("fs");
(function (module) {
    module.list = function (req, res, next) {
        console.log("1111");
        return next(err);
    }
    // 收藏，发表，粉丝
    module.get = function (req, res, next) {
        var skip = 0;
        async.parallel({
            user: function (callback) {
                User.findOne({_id:req.session.user._id},{password:0},function(err,user){
                    if(err) next(err);
                    user.follow = user.follow.length;
                    user.star = user.star.length;
                    callback(null,user);
                })
            },
            post: function (callback) {
                async.parallel({
                    topic:function(callback){
                        Post.find({user_id:req.session.user._id},{title:1,parent_url:1},{skip:skip,limit:10},function(err,post){
                            if(err) next(err);
                            callback(null,post);
                        })
                    },
                    comment:function(callback){
                        Comment.find({user_id:req.session.user._id},{content:1,post_id:1},{skip:skip,limit:10,sort:{createDate:-1}}).populate("post_id","_id,title").exec(function(err,comment){
                            if(err) next(err);
                            callback(null,comment);
                        })
                    }
                },function(err,result){
                    if (err) next(err);
                    callback(null, result);
                })
            },
            count: function (callback) {
                async.parallel({
                        postCount: function (callback) {
                            Post.find({user_id: req.session.user._id}).count(function (err, num) {
                                if (err) next(err);
                                callback(null, num);
                            })
                        },
                        replyCount: function (callback) {
                            Comment.find({user_id: req.session.user._id}).count(function (err, num) {
                                if (err) next(err);
                                callback(null, num);
                            })
                        }
                    }, function (err,result) {
                        if (err) next(err);
                        callback(null, result);
                    }
                )
            }
        },function(err,doc){
            if(err) next(err);
            res.json(doc);
        })

    }

    module.login = function (req, res, next) {
        var criteria = req.body;
        if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(criteria.email) || criteria.email === undefined) {
            res.json({"result": "failed"});
            return;
        }
        if (!/^\w{6,20}$/.test(criteria.password) || criteria.password === undefined) {
            res.json({"result": "failed"});
            return;
        }
        criteria.password = MD5(criteria.password);
        User.findOne(criteria, {email: 1, nick: 1, face: 1, rank: 1, status: 1}, function (err, doc) {
            if (err) next(err);
            if (doc !== null) {
                if (doc.status === 0) {
                    User.update(criteria, {$set: {loginDate: new Date(), loginIp: req.ip}}, function (err, num) {
                        if (err) next(err);
                        if (num > 0) {
                            req.session.user = doc;
                            res.cookie('user', doc, {httpOnly: false});
                            res.json({"result": "success"});
                        } else {
                            res.json({"result": "failed"});
                        }
                    })
                } else {
                    res.json({"result": "failed", "msg": "请激活此账号"});
                }
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    //注册
    module.register = function (req, res, next) {
        var criteria = req.body;
        if (!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(criteria.email) || criteria.email === undefined) {
            res.json({"result": "failed", "msg": "邮箱格式不正确"});
            return;
        }
        if (!/^\w{6,20}$/.test(criteria.password) || criteria.password === undefined) {
            res.json({"result": "failed", "msg": "密码格式不正确"});
            return;
        }
        if (!/^[A-Za-z0-9\u4e00-\u9fa5]{2,10}$/.test(criteria.nick) || criteria.nick === undefined) {
            res.json({"result": "failed", "msg": "昵称格式不正确"});
            return;
        }
        User.find({email: criteria.email}, function (err, doc) {
            if (err) next(err);
            if (doc.length === 0) {
                User.find({nick: criteria.nick}, function (err, nick) {
                    if (err) next(err);
                    if (nick.length === 0) {
                        criteria.password = MD5(criteria.password);
                        new User(criteria).save(function (err, doc) {
                            if (err) next(err);
                            if (doc !== undefined) {
                                res.json({"result": "success"});
                            } else {
                                res.json({"result": "failed"});
                            }
                        })
                    } else {
                        res.json({"result": "failed", "msg": "该昵称已存在"});
                    }
                })
            } else {
                res.json({"result": "failed", "msg": "该邮箱已注册过"});
            }
        })
    }

    //上传头像
    module.uploadFace = function(req,res,next){
        if(!/png|jpg/.test(req.files.file.extension)){
            res.json({"result":"failed","msg":"图片格式不正确"});
            return;
        }
        if(req.files.file.size>1024*1024*100){
            res.json({"result":"failed","msg":"图片太大了"});
            return;
        }
        var filename = req.session.user._id+"_"+Date.now()+"."+req.files.file.extension;
        fs.rename(req.files.file.path,"public\\uploads\\faces\\"+filename,function(err){
            if (err) throw next(err);
            User.update({_id:req.session.user._id},{$set:{face:filename}},function(err,num){
                if (err) throw next(err);
                if(num>0){
                    res.json({"result":"success","face":filename});
                } else {
                    res.json({"result":"failed"});
                }
            })
        });
    }

    //退出
    module.signOut = function (req, res) {
        req.session.destroy();
        res.clearCookie("user");
        res.json({"result": "success"});
    }
}(exports))