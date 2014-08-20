var ws = new WebSocket('ws://localhost');
var message = {};
var user = {};
var members = [];//在线用户组
var guests = 0;//来宾数量
var socketed = false;//socket连接状态
ws.onopen = function () {
    socketed = true;
    ws.onmessage = function (data) {
        message = JSON.parse(data.data);console.log(data.data);
        if (message.path === '/plaza') {
            if(message.type==="put"){
                members = message.members;
                guests = message.guest;
                if(members.length===0){
                    return;
                }
                for(var i in members){
                    var member = JSON.parse(members[i]);
                    $('#plaza-groups').append('<li class="inline-block"><a href="/user/'+member._id+'"><img src="uploads/faces/'+member.face+'"></a><p class="text-center">'+member.nick+'</p></li>')
                }
            }
        }
        if (message.path === '/plaza/chat') {
            user = JSON.parse(message.user);
            $(".chat-dialog").prepend('<li class="chat"><a href="/user/'+user._id+'"><img src="uploads/faces/' + user.face + '"></a><span class="username">' + user.nick + ':</span><span>' + message.message + '</span></li>');
        }
    }
}