var cookieParser = require('cookie');
var WebSocketServer = require('ws').Server
var hat = require('hat');
var onlineUsers = {};
var onlineNum = 0;

module.exports = function(server){
    var wss = new WebSocketServer({server: server,path:"/"});
    wss.broadcast = function(data) {
        for(var i in this.clients)
            this.clients[i].send(data);
    };
    wss.to = function(data){
        for(var i in this.clients){
            if(this.clients[i].id===data.to){
                this.clients[i].send(data.data);
            }
        }
    }
    wss.on('connection', function(ws) {
        if(ws.upgradeReq.headers.cookie===undefined){
            ws.terminate();
            return;
        }
        var id = hat();
        onlineUsers[id] = "123"
        ws.id=id;
        ++onlineNum;
        console.log('一个用户连接socket');
        ws.on('close', function() {
            delete onlineUsers[ws.id];
            --onlineNum;
            console.log('一个用户离开socket');
        })
        ws.on('message',function(data){
            if(data.to){
                wss.to(data);
            } else {
                wss.broadcast(data);
            }
        })
    });
}