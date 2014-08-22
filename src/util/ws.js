var cookieParser = require('cookie');
var WebSocketServer = require('ws').Server
var hat = require('hat');
var _ = require('underscore');
var onlineMember = 0;
var onlineGuest = 0;

module.exports = function (server) {
    var wss = new WebSocketServer({server: server, path: "/"});
    wss.broadcast = function (data, path) {
        for (var i in this.clients) {
            if (path) {
                if (path.indexOf(this.clients[i].path) !== -1) {
                    this.clients[i].send(data);
                }
            } else {
                this.clients[i].send(data);
            }
        }
    };
    wss.to = function (data) {
        for (var i in this.clients) {
            if (this.clients[i].user._id === data.to) {
                this.clients[i].send(data.data);
            }
        }
    }
    wss.on('connection', function (ws) {
        //判断来源是不是acgfun
        if (ws.upgradeReq.headers.origin !== "http://localhost" && ws.upgradeReq.headers.origin !== "http://www.acgfun.cn") {
            ws.terminate();
            return;
        }
        console.log('一个用户连接socket');
        ws.on('close', function () {
            if (ws.user) {
                --onlineMember;
//                如果在plaza断开的
                if (ws.path === "/plaza") {
//                    广播有人离开了,告诉离开用户信息;
                    //发送离开会员信息;
                    wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/left/member', members: ws.user, guest: onlineGuest}));
                }
                console.log('一个会员离开socket');
            } else {
                --onlineGuest;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/left/guest', members: [], guest: onlineGuest}), '/plaza');
                console.log('一个游客离开socket');
            }
        })
        ws.on('message', function (data) {
            var message = JSON.parse(data);
            /*处理连接 第一次连接*/
            //用户登陆后应该发送把自己的用户信息发送过来,发送user信息且没有储存过用户信息
            //会员登录
            if (!_.isEmpty(message.user) && _.isUndefined(ws.user)) {
                ++onlineMember;
                ws.user = message.user;
                console.log('一个会员连接socket');
            }
            //游客登录;
            if (_.isEmpty(message.user) && _.isUndefined(ws.path)) {
                ++onlineGuest;//如果user为空，则是游客;
                console.log('一个游客连接socket');
            }
            /*第一次连接处理结束*/

            //用户切换地址之后更新地址
            ws.path = message.path;

            if (message.path === '/plaza') {
                /*处理请求路径,切换页面的时候发送一个路径信息path*/
                var users = [];
                for (var i in wss.clients) {
                    if (_.isUndefined(wss.clients[i].user)) continue;//如果用户为空继续
                    users.push(wss.clients[i].user);//如果存在在放进集合;
                }
                //发送在线会员信息;
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/join', members: _.isEmpty(message.user) ? [] : message.user, guest: onlineGuest}), '/plaza');
                ws.send(JSON.stringify({path: '/plaza', members: users, guest: onlineGuest}), '/plaza');
                //如果是聊天
                if (message.suffix === '/chat') {
                    wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/chat', members: message.user, message: message.message}), '/plaza')
                }
            } else {
                //不管谁连上来了都广播给广场用户
                wss.broadcast(JSON.stringify({path: '/plaza', suffix: '/join', members: _.isEmpty(message.user) ? [] : message.user, guest: onlineGuest}), '/plaza')
            }

//            /*处理消息*/
//            //没有消息
//            if (_.isUndefined(message.message)) {
//                return;
//            }
//            //正常发消息
//            if (message.to) {
//                wss.to(data);
//            } else {
//                wss.broadcast(data);
//            }
        })
    });
}