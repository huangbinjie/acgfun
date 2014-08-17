// http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/
"use strict";

// Optional. You will see this name in eg. 'ps' or 'top' command
process.title = 'node-chat';

module.exports = function(app){
    var server = require('http').Server(app);
    var io = require('socket.io')(server);
    var plaza = io.of('/plaza');
    io.use(function(socket, next){
        if (socket.request.headers.cookie) next();
        else next(new Error('Authentication error'));
    });

//全部在线用户数
    var numUsers = 0;
//广场人数
    var numPlaza = 0;
//广场用户
    var userPlaza = {};

    /*主站："/" */
    io.on('connection', function(socket){
        //广播
        socket.emit('message', 'hello');
        //断开连接
        socket.on('disconnect', function(){{
            --numUsers;
            io.emit('left',{socketId:socket.id,user:socket.user,userCount:numUsers});
        }});
        /* 登陆
         {username:'data'}
         */
        socket.on('join',function(user){
            ++numUsers;
            socket.user = user;
            io.emit('join', {socketId:socket.id,user:socket.user,userCount:numUsers});
        })
        //收到消息
        socket.on('message',function(){})
        /* 加入广场事件
         {username:'data'}
         */
        socket.on('left',function(data){
            --numUsers;
            io.emit('left',{socketId:socket.id,user:socket.user,userCount:numUsers});
        })
    });

    /*广场:"/plaza" */
    plaza.on('connection', function(socket){
        socket.on('join',function(user){
            ++numPlaza;
            userPlaza[socket.id] = user;
            nsp.emit('Join',{socketId:socket.id,user:user});
        })
        socket.on('message',function(message){
            nsp.emit('message',{socketId:socket.id,user:socket.user,message:message})
        })
        socket.on('disconnect',function(){
            --numPlaza;
            nsp.emit('left',{socketId:socket.id,user:socket.user});
        })

    });
}