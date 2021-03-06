var User = require('../database/user_model');
var Post = require('../database/post_model');
var Team = require('../database/team_model');
var Comment = require('../database/comment_model');
var email = require('../util/email');
var settings = require('../config/settings');
var hat = require('hat');
var async = require('async');
var MD5 = require('MD5');
var fs = require("fs");
(function (module) {
    module.list = function (req, res, next) {
        console.log("1111");
        return next(err);
    }
    // 收藏，发表，粉丝,关注，经验，时间，最后在线
    module.get = function (req, res, next) {
        var skip = 0;
        var uid = req.params.uid ? req.params.uid : req.session.user._id;
        async.parallel({
            user: function (callback) {
                User.findOne({_id: uid}, {password: 0, message: 0, profile: 0, hat_id: 0}, function (err, user) {
                    if (err) next(err);
                    if (user) {
                        user.follow = user.follow.length;
                        user.star = user.star.length;
                        user.fans = user.fans.length;
                        callback(null, user);
                    } else {
                        next();
                    }
                })
            },
            isFollowed: function (callback) {
                if (req.session.user) {
                    User.find({_id: req.session.user._id, follow: {$in: [uid]}}, function (err, follow) {
                        if (err) next(err);
                        if (follow.length > 0) {
                            callback(null, true);
                        } else {
                            callback(null, false);
                        }
                    })
                } else {
                    callback(null, false);
                }
            },
            post: function (callback) {
                async.parallel({
                    topic: function (callback) {
                        Post.find({user_id: uid, deleteFlag: 0}, {title: 1, parent_url: 1,createDate:1}, {sort: {createDate: -1}, skip: skip, limit: 10}, function (err, post) {
                            if (err) next(err);
                            callback(null, post);
                        })
                    },
                    comment: function (callback) {
                        Comment.find({user_id: uid, deleteFlag: 0}, {content: 1, post_id: 1,createDate:1}, {sort: {createDate: -1}, skip: skip, limit: 10}).populate("post_id", {_id: 1, title: 1, createDate: 1, parent_url: 1}).exec(function (err, comment) {
                            if (err) next(err);
                            callback(null, comment);
                        })
                    }
                }, function (err, result) {
                    if (err) next(err);
                    callback(null, result);
                })
            },
            count: function (callback) {
                async.parallel({
                        postCount: function (callback) {
                            Post.find({user_id: uid}).count(function (err, num) {
                                if (err) next(err);
                                callback(null, num);
                            })
                        },
                        replyCount: function (callback) {
                            Comment.find({user_id: uid}).count(function (err, num) {
                                if (err) next(err);
                                callback(null, num);
                            })
                        }
                    }, function (err, result) {
                        if (err) next(err);
                        callback(null, result);
                    }
                )
            }
        }, function (err, doc) {
            if (err) next(err);
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
                            req.session.user = {_id: doc._id, rank: doc.rank, nick: doc.nick,face:doc.face};
                            res.json({"result": "success", "user": doc});
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
                        var id = hat();
                        criteria.password = MD5(criteria.password);
                        criteria.hat_id = id;
                        new User(criteria).save(function (err, doc) {
                            if (err) next(err);
                            if (doc !== undefined) {
                                email.transporter.sendMail({
                                    from: 'admin@acgfun.cn',
                                    to: criteria.email,
                                    subject: 'acgfun激活',
                                    html: settings.email.register +
                                        "<a href='http://www.acgfun.cn/user/active?email=" + criteria.email + "&id=" + id + "'>http://www.acgfun.cn/user/active?email=" + criteria.email + "&id=" + id
                                });
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
    module.uploadFace = function (req, res, next) {
        if (!/png|jpg/.test(req.files.file.extension)) {
            res.json({"result": "failed", "msg": "图片格式不正确"});
            fs.unlinkSync(req.files.file.path);
            return;
        }
        if (req.files.file.size > 1024 * 100) {
            res.json({"result": "failed", "msg": "图片太大了"});
            fs.unlinkSync(req.files.file.path);
            return;
        }
        var filename = req.session.user._id + "_face." + req.files.file.extension;
        fs.rename(req.files.file.path, "public//uploads//faces//" + filename, function (err) {
            if (err) throw next(err);
            User.update({_id: req.session.user._id}, {$set: {face: filename}}, function (err, num) {
                if (err) throw next(err);
                if (num > 0) {
                    res.json({"result": "success", "face": filename});
                } else {
                    res.json({"result": "failed"});
                }
            })
        });
    }

    //收藏
    module.star = function (req, res, next) {
        var pid = req.body.pid;
        if (pid === undefined) {
            res.json({"result": "failed"});
            return;
        }
        User.find({_id: req.session.user._id, star: {$in: [pid]}}, function (err, doc) {
            if (err) next(err);
            if (doc.length > 0) {
                res.json({"result": "failed", "msg": "已在你的收藏列表中"});
            } else {
                User.update({_id: req.session.user._id}, {$push: {star: pid}}, function (err, num) {
                    if (err) next(err);
                    if (num > 0) {
                        res.json({"result": "success"});
                    } else {
                        res.json({"result": "failed"});
                    }
                })
            }
        })
    }
    //关注
    module.follow = function (req, res, next) {
        var uid = req.body.uid;
        if (uid === undefined) {
            res.json({"result": "failed"});
            return;
        }
        User.find({_id: req.session.user._id, follow: {$in: [uid]}}, function (err, doc) {
            if (err) next(err);
            if (doc.length > 0) {
                res.json({"result": "failed", "msg": "已在你的关注列表中"});
            } else {
                async.parallel([function (callback) {
                    User.update({_id: req.session.user._id}, {$push: {follow: uid}}, function (err, num) {
                        if (err) next(err);
                        if (num > 0) {
                            callback(null, num);
                        } else {
                            res.json({"result": "failed"});
                        }
                    })
                }, function (callback) {
                    User.update({_id: uid}, {$push: {fans: req.session.user._id}}, function (err, num) {
                        if (err) next(err);
                        if (num > 0) {
                            callback(null, num);
                        } else {
                            res.json({"result": "failed"});
                        }
                    })
                }], function (err, result) {
                    if (err) next(err);
                    res.json({"result": "success"});
                })
            }
        })
    }

    //取消关注
    module.unfollow = function (req, res, next) {
        var uid = req.query.uid;
        if (uid === undefined) {
            res.json({"result": "failed"});
            return;
        }
        async.parallel([function (callback) {
            User.update({_id: req.session.user._id}, {$pull: {follow: uid}}, function (err, num) {
                if (err) next(err);
                if (num > 0) {
                    callback(null, num);
                } else {
                    res.json({"result": "failed"});
                }
            })
        }, function (callback) {
            User.update({_id: uid}, {$pull: {fans: req.session.user._id}}, function (err, num) {
                if (err) next(err);
                if (num > 0) {
                    callback(null, num);
                } else {
                    res.json({"result": "failed"});
                }
            })
        }], function (err, result) {
            if (err) next(err);
            res.json({"result": "success"});
        })
    }

    //已关注用户列表
    module.followed = function (req, res, next) {
        var skip = req.body.skip ? req.body.skip : 0;
        var users = [];
        User.findOne({_id: req.session.user._id}, {follow: {$slice: [skip, 10]}, _id: 1}, function (err, user) {
            if (err) next(err);
            if (user) {
                async.each(user.follow, function (follow, callback) {
                    User.findOne({_id: follow}, {_id: 1, face: 1, nick: 1}, function (err, doc) {
                        if (err) next(err);
                        if (doc) {
                            users.push(doc);
                            callback();
                        }
                    })
                }, function (err) {
                    if (err) next(err);
                    res.send(users);
                })
            } else {
                res.send(users);
            }
        })
    }

    //激活邮箱
    module.active = function (req, res, next) {
        var email = req.body.email;
        var id = req.body.id;
        if (email === undefined || email === "") {
            res.json({"result": "failed"});
            return;
        }
        if (id === undefined || id === "") {
            res.json({"result": "failed"});
            return;
        }
        User.update({email: email, hat_id: id}, {$set: {status: 0}}, function (err, num) {
            if (err) next(err);
            if (num > 0) {
                res.json({"result": "success", "msg": "激活成功"});
            } else {
                res.json({"result": "failed", "msg": "激活失败"});
            }
        })
    }
    //忘记密码
    module.forgot = function (req, res, next) {
        var email = req.body.email;
        var id = hat();
        User.update({email: email}, {$set: {hat_id: id}}, {upsert: true}, function (err, num) {
            if (err) next(err);
            if (num > 0) {
                email.transporter.sendMail({
                    from: 'admin@acgfun.cn',
                    to: email,
                    subject: 'acgfun重置密码',
                    html: settings.email.reset +
                        "<a href='http://www.acgfun.cn/user/reset?email=" + email + "&id=" + id + "'>http://www.acgfun.cn/user/reset?email=" + email + "&id=" + id
                });
                res.json({"result": "index.html#/reset"});
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    //发送邮箱验证
    module.reActive = function (req, res, next) {
        var criteria = req.body;
        var id = hat();
        User.update({email: criteria.email}, {$set: {hat_id: id}}, {upsert: true}, function (err, num) {
            if (err) next(err);
            if (num > 0) {
                email.transporter.sendMail({
                    from: 'admin@acgfun.cn',
                    to: criteria.email,
                    subject: 'acgfun激活',
                    html: settings.email.register +
                        "<a href='http://www.acgfun.cn/user/active?email=" + criteria.email + "&id=" + id + "'>http://www.acgfun.cn/user/active?email=" + criteria.email + "&id=" + id
                }, function (err, info) {
                    if (err) res.json({"result": "failed"});
                    else res.json({"result": "success"});
                });
            } else {
                res.json({"result": "failed"});
            }
        })
    }
    //重置密码
    module.resetPass = function (req, res, next) {
        var criteria = req.body;
        if (!/^\w{6,20}$/.test(criteria.newPassword) || criteria.newPassword === undefined) {
            res.json({"result": "failed", "msg": "新密码格式不正确"});
            return;
        }
        if (!/^\w{6,20}$/.test(criteria.currentPassword) || criteria.currentPassword === undefined) {
            res.json({"result": "failed", "msg": "当前密码格式不正确"});
            return;
        }
        User.findOne({_id: req.session.user._id, password: MD5(criteria.currentPassword)}, {password: 1}, function (err, user) {
            if (err) next(err);
            if (user) {
                User.update({_id: req.session.user._id}, {$set: {password: MD5(criteria.newPassword)}}, function (err, num) {
                    if (err) next(err);
                    if (num > 0) {
                        res.json({"result": "success"});
                    } else {
                        res.json({"result": "failed"});
                    }
                })
            } else {
                res.json({"result": "failed", "msg": "当前密码不正确"});
            }
        })
    }
    //忘记密码重置密码
    module.forgotPass = function (req, res, next) {
        if (!/^\w{6,20}$/.test(req.body.newPassword) || req.body.newPassword === undefined) {
            res.json({"result": "failed", "msg": "新密码格式不正确"});
            return;
        }
        User.update({email: req.body.email}, {$set: {password: MD5(req.body.newPassword)}}, function (err, num) {
            if (err) next(err);
            if (num > 0) {
                res.json({"result": "success"});
            } else {
                res.json({"result": "failed"});
            }
        })
    }
    //用户属性
    module.getProfile = function (req, res, next) {
        User.findOne({_id: req.session.user._id}, {profile: 1}, function (err, user) {
            if (err) next(err);
            res.json(user.profile);
        })
    }
    //设置用户属性
    module.setProfile = function (req, res, next) {
        User.update({_id: req.session.user._id}, {$set: {profile: req.body.profile}}, function (err, num) {
            if (err) next(err);
            if (num > 0) {
                res.json({"result": "success"});
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    //文章管理
    module.topicManage = function (req, res, next) {
        var skip = req.body.skip ? req.body.skip : 0;
        async.parallel({
            topics: function (callback) {
                Post.find({deleteFlag: 0}, {_id: 1, user_id: 1, title: 1, view: 1, createDate: 1}, {sort: {order: 1, createDate: -1}, skip: skip, limit: 20}, function (err, docs) {
                    if (err) next(err);
                    callback(null, docs)
                })
            },
            count: function (callback) {
                Post.count({user_id: req.session.user._id, deleteFlag: 0}, function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    //评论管理
    module.commentManage = function (req, res, next) {
        var skip = req.body.skip ? req.body.skip : 0;
        async.parallel({
            comments: function (callback) {
                Comment.find({user_id: req.session.user._id, deleteFlag: 0}, {content: 1, post_id: 1}, {sort: {createDate: -1}, skip: skip, limit: 10}).populate("post_id", {_id: 1, title: 1, createDate: 1, parent_url: 1}).exec(function (err, comment) {
                    if (err) next(err);
                    callback(null, comment);
                })
            },
            count: function (callback) {
                Comment.count({user_id: req.session.user._id, deleteFlag: 0}, function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    //回复管理
    module.replyManage = function (req, res, next) {
        var skip = req.body.skip ? req.body.skip : 0;
        User.findOne({_id: req.session.user._id}, {_id: 1, reply: {$slice: [skip, 20]}}, function (err, user) {
            if (err) next(err);
            if (user) {
                async.each(user.reply, function (reply, callback) {
                    async.parallel([function (callback) {
                        User.findOne({_id: reply._doc._id}, {nick: 1}, function (err, user) {
                            if (err) next(err);
                            reply._doc._id = {_id:reply._doc._id,nick:user.nick};
                            callback();
                        })
                    }, function (callback) {
                        Post.findOne({_id: reply._doc.post_id}, {parent_url:1,title: 1}, function (err, post) {
                            if (err) next(err);
                            reply._doc.post_id = {_id: reply._doc.post_id, title:post.title,parent_url:post.parent_url};
                            callback();
                        });
                    }, function (callback) {
                        Comment.findOne({_id: reply._doc.comment_id}, {content: 1}, function (err, comment) {
                            if (err) next(err);
                            reply._doc.comment_id = {_id: reply._doc.comment_id, content:comment.content};
                            callback();
                        });
                    }], function (err, result) {
                        if (err) next(err);
                        callback();
                    })
                }, function (err) {
                    if (err) next(err);
                    res.json(user);
                })
            } else {
                res.json(user);
            }
        })
    }

    //退出
    module.signOut = function (req, res) {
        req.session.destroy();
        res.json({"result": "success"});
    }
}(exports))