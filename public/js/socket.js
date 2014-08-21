var ws = new WebSocket('ws://localhost');
var message = {};
var user = {};
var members = [];//在线用户组
var guests = 0;//来宾数量
var socketed = false;//socket连接状态
ws.onopen = function () {
    socketed = true;
    ws.onmessage = function (data) {
        message = JSON.parse(data.data);
        console.log(data.data);
        if (message.path === '/plaza') {
            members = message.members;
            guests = message.guest;
            if (message.suffix === "/join") {
                if (members.length === 0) return;
//                var member = JSON.parse(members);
                $('#plaza-groups').append('<li class="inline-block" id="' + members._id + '"><a href="/user/' + members._id + '"><img src="uploads/faces/' + members.face + '"></a><p class="text-center">' + members.nick + '</p></li>')
            } else if (message.suffix === "/left/member") {
                $('#' + members._id).remove();
            } else if (message.suffix === '/chat') {
//                var user = JSON.parse(members);
                $(".chat-dialog").prepend('<li class="chat"><a href="/user/' + members._id + '"><img src="uploads/faces/' + members.face + '"></a><span class="username">' + members.nick + ':</span><span>' + message.message + '</span></li>');
            } else {
                if (members.length === 0) {
                    return;
                }
                $('#plaza-groups').empty();
                for (var i in members) {
//                    var member = JSON.parse(members[i]);
                    $('#plaza-groups').append('<li class="inline-block" id="' + members[i]._id + '"><a href="/user/' + members[i]._id + '"><img src="uploads/faces/' + members[i].face + '"></a><p class="text-center">' + members[i].nick + '</p></li>')
                }
            }
        }
    }
}