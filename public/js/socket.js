var ws = new WebSocket('ws://acgfun.cn');
var message = {};
var user = {};
ws.onopen = function(){
    ws.onmessage = function(data){
        message = JSON.parse(data.data);
        user = JSON.parse(message.user);
        $(".chat-dialog").prepend('<li class="chat"><img src="uploads/faces/'+user.face+'"><span class="username">'+user.nick+':</span><span>'+message.message+'</span></li>');
    }
}