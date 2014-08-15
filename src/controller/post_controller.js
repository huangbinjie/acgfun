/**
 * Created by hbj on 2014/8/9.
 */
var Post = require('../database/post_model');
var Team = require('../database/team_model');
var Comment = require('../database/comment_model');
var User = require('../database/user_model');
var async = require('async');
(function (module) {
    /*
     返回结果:{_id,title,user_id:{face},createDate,view,profile:{replyCount,commenter:{face,createDate}}}
     */
    module.list = function (req, res, next) {
        var skip = 0;
        Post.find({parent_url: req.url, deleteFlag: 0}, {_id: 1, user_id: 1, title: 1, view: 1, createDate: 1}, {skip: skip, limit: 30, sort: {order: 1, _id: 1}})
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
                    res.json(docs);
                })
            })
    }

    module.put = function (req, res, next) {
        var criteria = req.body;
        if (criteria.title === undefined || criteria.title === "" || criteria.title === null) {
            return;
        }
        if (criteria.content === undefined || criteria.content === "" || criteria.content === null) {
            return;
        }
        criteria.parent_url = req.url;
        criteria.user_id = req.session.user._id;
        new Post(criteria).save(function (err, doc) {
            if (err) next(err);
            if (doc !== undefined) {
                res.json({"result": "success"});
            } else {
                res.json({"result": "failed"});
            }
        })
    }

    /*topic页面*/
    module.getTopic = function (req, res, next) {
        var pid = req.params.pid;
        var skip = req.body.skip ? req.body.skip : 0;
        async.parallel({
            comments: function (callback) {
                Comment.find({post_id: pid, deleteFlag: 0}, {_id: 1, user_id: 1, content: 1, createDate: 1}).populate("user_id", {face: 1, nick: 1}).sort({_id: 1})
                    .skip(skip)
                    .limit(30)
                    .exec(function (err, docs) {
                        if (err) next(err);
                        if (req.session.user) {
                            async.each(docs, function (doc, callback) {
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
                            callback(null, docs);
                        }
                    })
            },
            topic: function (callback) {
                if (skip > 0) {
                    callback(null, null);
                    return;
                }
                Post.findOne({_id: pid, deleteFlag: 0}, {_id: 1, user_id: 1, title: 1, content: 1, createDate: 1}).populate('user_id', {face: 1, nick: 1}).exec(function (err, doc) {
                    if (err) next(err);
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
                            User.find({_id: req.session.user._id, star: {$in: [pid]}}, function (err, follow) {
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
                })
            },
            count: function (callback) {
                Comment.find({post_id: pid, deleteFlag: 0}).count(function (err, num) {
                    if (err) next(err);
                    callback(null, num);
                })
            }}, function (err, result) {
            if (err) next(err);
            res.json(result);
        })
        Post.update({_id: pid}, {$inc: {view: 1}}, function (err, num) {
            if (err) next(err);
        })
    }

    module.putComment = function (req, res, next) {
        var comment = req.body;
        if (comment.content === undefined || comment.content === "" || comment.content === null) {
            res.json({"result": "failed"});
            return;
        }
        comment.user_id = req.session.user._id;
        var post_user_id = comment.post_user_id;
        delete comment.post_user_id;
        new Comment(comment).save(function (err, doc) {
            if (err) next(err);
            if (doc !== undefined) {
                async.parallel([function (callback) {
                    User.update({_id: post_user_id}, {$inc: {exp: 1}}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }, function (callback) {
                    User.update({_id: comment.user_id}, {$inc: {exp: 1}}, function (err, num) {
                        if (err) next(err);
                        callback(null, num);
                    })
                }], function (err, result) {
                    if (err) next(err);
                    res.json({"result": "success"});
                })
            }
            else res.json({"result": "failed"});
        })
    }

    module.delete = function (req, res, next) {
        var type = req.query.type;
        var id = req.query.id;
        if (type === "p") {
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
        if (type === "c") {
            Comment.update({_id: id}, {$set: {deleteFlag: 1}}, {upsert: true}, function (err, num) {
                if (err) next(err);
                if (num > 0) {
                    res.json({"result": "success"});
                } else {
                    res.json({"result": "failed"});
                }
            })
        }
    }
}(exports))