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
        members = message.members;
        if ('/plaza'.indexOf(message.path) !== -1) {
            guests = message.guest;
            if (message.suffix === "/join/member") {
                if (members.length === 0) return;
                if (members.face === undefined) members.face = "default.jpg";
                $('#plaza-groups').append('<li class="inline-block" id="' + members._id + '"><a href="/user/' + members._id + '"><img src="uploads/faces/' + members.face + '"></a><p class="text-center">' + members.nick + '</p></li>')
            } else if (message.suffix === "/left/member") {
                $('#' + members._id).remove();
            } else if (message.suffix === '/chat') {
                $(".chat-dialog").prepend('<li class="chat"><a href="/user/' + members._id + '"><img src="uploads/faces/' + members.face + '"></a><span class="username">' + members.nick + ':</span><span>' + message.message + '</span></li>');
            } else {
                if (members.length === 0) {
                    return;
                }
                $('#plaza-groups').empty();
                for (var i in members) {
                    if (members[i].face === undefined) members[i].face = "default.jpg";
                    $('#plaza-groups').append('<li class="inline-block" id="' + members[i]._id + '"><a href="/user/' + members[i]._id + '"><img src="uploads/faces/' + members[i].face + '"></a><p class="text-center">' + members[i].nick + '</p></li>')
                }
            }
        }
        if('/'.indexOf(message.path)!==-1){
            if(message.suffix==='to'){
                    $("#chat .badge").val(parseInt($("#chat .badge").val())+1);
            }
           if($('.modal.chat').find('#chat_title_'+members._id).length===0){
               $('.modal.chat .left-panel').append('<div class="row active" id="chat_title_'+members._id+'"><span>'+members.nick+'</span></div>');
               $('.modal.chat .left-panel').after('<ul class="right-panel clearfloat">' +
                   '<li class="right"><a><img class="face" src="images/'+members.face+'"></a></li>' +
                   '<li>'+message.message+'</li>'+
                   '</ul>');
               $('#chat_title_'+members._id).click(function(){
                   $(this).remove();
                   $('#chat_content_'+members._id).next().removeClass("hide").addClass("show");
                   $('#chat_content_'+members._id).remove();
               })
           }
            if($('.modal.chat').find('#chat_title_'+members._id).length>0){
                $('.modal.chat .left-panel').append('<div class="row hide" id="chat_title_'+members._id+'"><span>'+members.nick+'</span></div>');
                $('.modal.chat .left-panel').after('<ul class="right-panel clearfloat hide">' +
                    '<li class="right"><a><img class="face" src="images/'+members.face+'"></a></li>' +
                    '<li>'+message.message+'</li>'+
                    '</ul>');
                $('#chat_title_'+members._id).click(function(){
                    $(this).remove();
                    $('#chat_content_'+members._id).next().removeClass("hide").addClass("show");
                    $('#chat_content_'+members._id).remove();
                })
            }
        }
    }
}