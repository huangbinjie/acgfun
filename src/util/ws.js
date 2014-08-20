var cookieParser = require('cookie');
var WebSocketServer = require('ws').Server
var hat = require('hat');
var _ = require('underscore');
var onlineMember = 0;
var onlineGuest = 0;

module.exports = function (server) {
    var wss = new WebSocketServer({server: server, path: "/"});
    wss.broadcast = function (data) {
        for (var i in this.clients)
            this.clients[i].send(data);
    };
    wss.to = function (data) {
        for (var i in this.clients) {
            if (this.clients[i].id === data.to) {
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
        ++onlineGuest;//如果user为空，则是游客;
        console.log('一个用户连接socket');
        ws.on('close', function () {
            if (ws.id) {
                --onlineMember;
                console.log('一个会员离开socket');
//                如果在plaza断开的
                if (ws.id.path === "/plaza") {
//                    广播有人离开了,告诉离开用户信息;
                    var users = [];
                    for (var i in wss.clients) {
                        if (_.isUndefined(wss.clients[i].id)) continue;//如果用户为空继续
                        users.push(wss.clients[i].id.user);//如果存在在放进集合;
                    }
                    //发送在线会员信息;
                    wss.broadcast(JSON.stringify({path: '/plaza', type: 'put', members: users, guest: onlineGuest}));
                }
            } else {
                --onlineGuest;
                console.log('一个游客离开socket');
            }
        })
        ws.on('message', function (data) {
            var message = JSON.parse(data);
            /*处理连接*/
            //用户登陆后应该发送把自己的用户信息发送过来,发送user信息且没有分配过ID
            if (!_.isEmpty(message.user) && _.isUndefined(ws.id)) {
                //如果没有ID则分配一个id
                var id = hat();
                //带有user则是会员,并存进member{id:{user,path}}
                ++onlineMember;
                //把id存进连接中
                ws.id = {id:id,user:message.user,path:message.path};
                //会员加1，游客-1,游客转会员的意思
                --onlineGuest;
            }

            /*处理请求路径,切换页面的时候发送一个路径信息path*/
            if (message.path === '/plaza') {
                var users = [];
                for (var i in wss.clients) {
                    if (_.isUndefined(wss.clients[i].id)) continue;//如果用户为空继续
                    users.push(wss.clients[i].id.user);//如果存在在放进集合;
                }
                //发送在线会员信息;
                wss.broadcast(JSON.stringify({path: '/plaza', type: 'put', members: users, guest: onlineGuest}));
            }

            /*处理消息*/
            //没有消息
            if (_.isUndefined(message.message)) {
                return;
            }
            //正常发消息
            if (message.to) {
                wss.to(data);
            } else {
                wss.broadcast(data);
            }
        })
    });
}