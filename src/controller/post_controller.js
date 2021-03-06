/**
 * Created by hbj on 2014/8/9.
 */
var Post = require('../database/post_model');
var Team = require('../database/team_model');
var Comment = require('../database/comment_model');
var User = require('../database/user_model');
var async = require('async');
var wss = require('../util/ws').getWss();
(function (module) {
    /*
     返回结果:{_id,title,user_id:{face},createDate,view,profile:{replyCount,commenter:{face,createDate}}}
     */
    module.list = function (req, res, next) {
        var skip = req.body.skip?req.body.skip:0;
        async.parallel({
            posts: function (callback) {
                Post.find({parent_url: req.url, deleteFlag: 0}, {_id: 1, user_id: 1, title: 1, view: 1, createDate: 1}, {sort: {order: 1, createDate: -1}, skip: skip, limit: 30})
                    .populate('user_id', "face")
                    .exec(function (err, docs) {
                        if (err) next(err);
                        async.each(docs, function (doc, callback) {
                            async.parallel({
                                    replyCount: function (callback) {
                                        Comment.find({post_id: doc._id, deleteFlag: 0}).count(function (err, num) {
                                            if (err) next(err);
                                            callback(null, num);
                                        })
                                    },
                                    commenter: function (callback) {
                                        Comment.find({post_id: doc._id, deleteFlag: 0}, {user_id: 1, createDate: 1}).sort({createDate: -1}).limit(1).populate("user_id", "face").exec(function (err, comment) {
                                            if (err) next(err);
                                            callback(null, comment);
                                        })
                                    }
                                },
                                function (err, result) {
                                    if (err) next(err);
                                    doc._doc.replyCount = result.replyCount;
                                    doc._doc.commenter = result.commenter;
                                    callback();
                                }
                            )
                        }, function (err) {
                            if (err) next(err);
                            callback(null, docs)
                        })
                    })
            },
            count: function (callback) {
                Post.find({parent_url: req.url, deleteFlag: 0}).count(function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }
        }, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
    }

    module.put = function (req, res, next) {
        var criteria = req.body;
        if (criteria.title === undefined||criteria.title === ""||criteria.title.length>50) {
            res.json({"result": "failed", "msg": "标题格式不正确"});
            return;
        }
        if (criteria.content === undefined || criteria.content === ""||criteria.content.length>1000) {
            res.json({"result": "failed","msg":"内容格式不正确"});
            return;
        }
        criteria.parent_url = req.url;
        criteria.user_id = req.session.user._id;
        new Post(criteria).save(function (err, doc) {
            if (err) next(err);
            if (doc) {
                res.json({"result": "success"});
                wss.broadcast(JSON.stringify({path:'/',suffix:'/join/topic',message:req.url}));
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    /*topic页面*/
    module.getTopic = function (req, res, next) {
        var url = req.url.split('/')
        var skip = req.body.skip ? req.body.skip : 0;
        async.parallel({
            comments: function (callback) {
                Comment.find({post_id: url[2], deleteFlag: 0}, {_id: 1, user_id: 1, content: 1, createDate: 1, parent_id: 1})
                    .populate("user_id", {face: 1, nick: 1})
                    .populate("parent_id", {user_id: 1, content: 1})
                    .sort({_id: 1})
                    .skip(skip)
                    .limit(30)
                    .exec(function (err, docs) {
                        if (err) next(err);
                        async.parallel([function (callback) {
                            if (req.session.user) {
                                async.each(docs, function (doc, callback) {
                                    //是否已关注用户
                                    User.find({_id: req.session.user._id, follow: {$in: [doc.user_id._id]}}, function (err, follow) {
                                        if (err) next(err);
                                        if (follow.length > 0) {
                                            doc._doc.user_id._doc.isFollow = true;
                                        }
                                        callback();
                                    })
                                }, function (err) {
                                    if (err) next(err);
                                    callback(null, docs);
                                })
                            } else {
                                callback();
                            }
                        }, function (callback) {
                            async.each(docs, function (doc, callback) {
                                //查找被回复者昵称
                                if (doc.parent_id === null) {
                                    callback();
                                } else {
                                    User.findOne({_id: doc._doc.parent_id._doc.user_id}, {nick: 1}, function (err, nick) {
                                        if (err) next(err);
                                        if (nick) {
                                            doc._doc.parent_id._doc.user_nick = nick.nick;
                                        }
                                        callback();
                                    })
                                }
                            }, function (err) {
                                if (err) next(err);
                                callback();
                            })
                        }], function (err, result) {
                            if (err) next(err);
                            callback(null, docs);
                        })
                    })
            },
            topic: function (callback) {
                Post.findOne({_id: url[2], deleteFlag: 0,parent_url:"/"+url[1]}, {_id: 1, user_id: 1, title: 1, content: 1, createDate: 1}).populate('user_id', {face: 1, nick: 1}).exec(function (err, doc) {
                    if (err) next(err);
                    if(doc){
                        //如果登陆用户则还要查找是否是关注的人和收藏的文章
                        if (req.session.user) {
                            async.parallel([function (callback) {
                                User.find({_id: req.session.user._id, follow: {$in: [doc.user_id._id]}}, function (err, follow) {
                                    if (err) next(err);
                                    if (follow.length > 0) {
                                        doc._doc.user_id._doc.isFollow = true;
                                    }
                                    callback(null, doc);
                                })
                            }, function (callback) {
                                User.find({_id: req.session.user._id, star: {$in: [url[2]]}}, function (err, follow) {
                                    if (err) next(err);
                                    if (follow.length > 0) {
                                        doc._doc.user_id._doc.isStar = true;
                                    }
                                    callback(null, doc);
                                })
                            }], function (err, result) {
                                if (err) next(err);
                                callback(null, doc);
                            })
                        } else {
                            callback(null, doc);
                        }
                    }else{
                        callback(null, doc);
                    }
                })
            },
            count: function (callback) {
                Comment.find({post_id: url[2], deleteFlag: 0}).count(function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }}, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
        Post.update({_id: url[2]}, {$inc: {view: 1}}, function (err, num) {
            if (err) next(err);
        })
    }

    module.putComment = function (req, res, next) {
        var comment = req.body;
        if (comment.content === undefined || comment.content === "" || comment.content === null) {
            res.json({"result": "failed"});
            return;
        }
        var url = req.url.split('/');//["",a,1,内容]
        new Comment({parent_url:'/'+url[1],post_id: url[2], user_id: req.session.user._id, content: comment.content, parent_id: comment.parent_id ? comment.parent_id : 0}).save(function (err, doc) {
            if (err) next(err);
            if (doc) {
                async.parallel([function (callback) {
                    //给楼主加经验
                    User.update({_id: comment.post_user_id}, {$inc: {exp: 1}}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }, function (callback) {
                    //给自己加经验
                    User.update({_id: req.session.user._id}, {$inc: {exp: 1}}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }], function (err, result) {
                    if (err) next(err);
                    res.json({"result": "success"});
                    if (comment.parent_id) {
                        //告诉层主
                        wss.reply({pid:url[2],to: comment.parent_user_id, user: {_id: 0, nick: '系统消息', face: "System.png"}, message: req.session.user.nick + "回复你:<br/><a href='/" + url[1] + "/" +
                            url[2] + "/" + url[3] + "?scrollTo=" + doc._id + "' target='_blank'>" + doc.content + "</a>"});
                    } else {
                        //告诉楼主
                        wss.reply({pid:url[2],cid:doc._id,to: comment.post_user_id, user: {_id: 0, nick: '系统消息', face: "System.png"}, message: req.session.user.nick + "回复你:<br/><a href='/" + url[1] + "/" +
                            url[2] + "/" + url[3] + "?scrollTo=" + doc._id + "' target='_blank'>" + doc.content + "</a>"});
                    }
                    wss.broadcast(JSON.stringify({path:'/',suffix:'/join/comment',message:url[2]}));
                })
            }
            else res.json({"result": "failed"});
        })
    }

    module.delete = function (req, res, next) {
        var type = req.query.type;
        var id = req.query.id;
        if (type === "p") {
            if (req.session.user.rank === 1) {
                async.parallel([function (callback) {
                    Post.update({_id: id, user_id: req.session.user._id}, {$set: {deleteFlag: 1}}, {upsert: true}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }, function (callback) {
                    Comment.update({post_id: id}, {$set: {deleteFlag: 1}}, {upsert: true, multi: true}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    });
                }], function (err, result) {
                    if (err) next(err);
                    res.json({"result": "success"});
                })
            }
            if (req.session.user.rank !== 1) {
                async.parallel([function (callback) {
                    Post.update({_id: id}, {$set: {deleteFlag: 1}}, {upsert: true}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }, function (callback) {
                    Comment.update({post_id: id}, {$set: {deleteFlag: 1}}, {upsert: true, multi: true}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    });
                }], function (err, result) {
                    if (err) next(err);
                    res.json({"result": "success"});
                })
            }
        }
        if (type === "c") {
            //如果是管理员
            if (req.session.user.rank !== 1) {
                Comment.update({_id: id}, {$set: {deleteFlag: 1}}, {upsert: true}, function (err, num) {
                    if (err) next(err);
                    if (num > 0) {
                        res.json({"result": "success"});
                    } else {
                        res.json({"result": "failed"});
                    }
                })
            }
            //如果是普通用户
            if (req.session.user.rank === 1) {
                Comment.update({_id: id, user_id: req.session.user._id}, {$set: {deleteFlag: 1}}, {upsert: true}, function (err, num) {
                    if (err) next(err);
                    if (num > 0) {
                        res.json({"result": "success"});
                    } else {
                        res.json({"result": "failed"});
                    }
                })
            }
        }
    }
}(exports))