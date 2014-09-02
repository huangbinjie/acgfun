var async = require('async');
var WebSocketServer = require('ws').Server
var _ = require('underscore');
var escape = require('escape-html');
var User = require('../database/user_model');
var onlineMember = 0;
var onlineGuest = 0;

module.exports = function (server) {
    var wss = new WebSocketServer({server: server, path: "/"});
    wss.broadcast = function (data, path) {
        for (var i in this.clients) {
            if (path) {
                if (this.clients[i].path.indexOf(path) !== -1) {
                    this.clients[i].send(data);
                }
            } else {
                this.clients[i].send(data);
            }
        }
    };
    wss.to = function (toId,user,message) {
        for (var i in this.clients) {
            if (this.clients[i].user._id == toId) {
                this.clients[i].send(JSON.stringify({path: '/', suffix: '/to', members: user,date:new Date(), message: message}));
                return true;
            }
        }
        return false;
    }
    wss.on('connection', function (ws) {
        //判断来源是不是acgfun
        if (ws.upgradeReq.headers.origin !== "http://localhost" && ws.upgradeReq.headers.origin !== "http://www.acgfun.cn") {
            ws.terminate();
            return;
        }
        ws.on('close', function () {
            if (ws.member) {
                --onlineMember;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/left/member', members: ws.user, guest: onlineGuest}),'/plaza');
                //更新离线状态
                wss.broadcast(JSON.stringify({path:'/',suffix:'left/member',user_id:ws.user._id}));
                //更新到数据库
                User.update({_id:ws.user._id},{$set:{online:0}},{upsert:true},function(){
                if(err) throw err;
                })
                console.log('会员:'+onlineMember+'游客:'+onlineGuest);
            }
            if(ws.guest){
                --onlineGuest;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/left/guest', members: [], guest: onlineGuest}), '/plaza');
                console.log('会员:'+onlineMember+'游客:'+onlineGuest);
            }
        })
        ws.on('message', function (data) {
            var message = JSON.parse(data);
            //用户切换地址之后更新地址
            ws.path = message.path;//告诉你在那
            ws.user = message.user;//告诉你是谁
            /*处理连接 第一次连接*/
            //用户登陆后应该发送把自己的用户信息发送过来,发送user信息且没有储存过用户信息
            //会员登录
            if (!_.isEmpty(ws.user) && ws.member !== true) {
                ws.member = true;
                ++onlineMember;
                if (ws.guest === true) --onlineGuest;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/join/member', members: _.isEmpty(message.user) ? [] : message.user, guest: onlineGuest}), '/plaza')
               //更新在线状态
                wss.broadcast(JSON.stringify({path:'/',suffix:'join/member',user_id:ws.user._id}));
                //更新到数据库
                User.update({_id:ws.user._id},{$set:{online:1}},{upsert:true},function(){
                    if(err) throw err;
                })
                console.log('会员:'+onlineMember+'游客:'+onlineGuest);
                //查找未读消息
                User.aggregate({$match:{_id:ws.user._id}},{$unwind:"$message"},{$match:{'message.read':0}},{$project:{message:1}},function(err,docs){
                    if(err) throw err;
                    if(docs.length>0){
                        async.each(docs,function(message,callback){
                            User.findOne({_id:message.message._id},{_id:1,email:1,face:1,nick:1},function(err,user){
                                if(err) throw err;
                                message.message.user = user;
                                callback();
                            })
                        },function(err){
                            if(err) throw err;
                            //留言信息
                            docs.forEach(function(message){
                                ws.send(JSON.stringify({path:'/',suffix:'/to',members:message.message.user,message:message.message.message,date:message.message.date}));
                            })
                            //清空消息
                            User.update({_id:ws.user._id},{$set:{message:[]}},function(err,num){
                                if(err) throw err;
                            })
                        })
                    }
                })
            }
            //游客登录;
            if (_.isEmpty(ws.user) && ws.guest !== true) {
                ws.guest = true;
                ++onlineGuest;//如果user为空，则是游客;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/join/guest', members: _.isEmpty(message.user) ? [] : message.user, guest: onlineGuest}), '/plaza')
                console.log('游客:'+onlineGuest+'会员:'+onlineMember);
            }
            /*第一次连接处理结束*/
            if (message.path.indexOf('/plaza') != -1) {
                /*处理请求路径,切换页面的时候发送一个路径信息path*/
                var users = [];
                for (var i in wss.clients) {
                    if (_.isEmpty(wss.clients[i].user)) continue;//如果用户为空继续
                    users.push(wss.clients[i].user);//如果存在在放进集合;
                }
                //发送在线会员信息;
                ws.send(JSON.stringify({path: '/plaza',suffix:'/join', members: users, guest: onlineGuest}));
                //如果是聊天
                if (message.suffix === '/chat') {
                    wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/chat', members: message.user, message: escape(message.message)}), '/plaza')
                }
            }

            if(message.path.indexOf('/') != -1){
                /*处理消息*/
                //没有消息
                if (_.isUndefined(message.message)||message.message==="") {
                    return;
                }
                if (message.suffix === '/to'&& !_.isUndefined(message.to)) {
                    var isSend = wss.to(message.to,message.user,escape(message.message));
                    if(!isSend){
                        //保留100条留言
                        User.update({_id:message.to},{$push:{message:{$each:[{_id:message.user._id,read:0,message:message.message}],$slice: -100}}},function(err,num){
                            if(err) throw  err;
                            if(num>0){
                                //系统信息
                                User.findOne({_id:message.to},{_id:1,email:1,face:1,nick:1},function(err,user){
                                    if(err) throw err;
                                    if(user){
                                        ws.send(JSON.stringify({path: '/', suffix: '/to', members: user,date:new Date(), message: '已留言--系统消息'}));
                                    }
                                })
                            }
                        })
                    }
                }
            }
        })
    });
}

/**
 * Helper function for escaping input strings

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
*/