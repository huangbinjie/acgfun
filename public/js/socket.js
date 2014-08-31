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
            } else if (message.suffix === '/join') {
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
        if ('/'.indexOf(message.path) !== -1) {
            if (message.suffix === '/to') {
                $('audio')[0].play();
                $("#chat .badge").val(parseInt($("#chat .badge").val()) + 1);
                //            有聊天记录的时候
                if ($('.modal.chat .left-panel').children().size() > 0) {
                    if ($("#chat_title_" + members._id).size() > 0) {
                        $("#chat_content_" + members._id).append('<li>' + message.message + '</li>');
                    } else {
                        var date = new Date(message.date);
                        $('.modal.chat .left-panel').prepend('<div class="row" data-id="' + members._id + '" id="chat_title_' + members._id + '"><span>' + members.nick + '</span></div>');
                        $('.modal.chat .left-panel').after('<ul id="chat_content_' + members._id + '" class="right-panel clearfloat hide">' +
                            '<li class="right"><a href="/user/'+members._id+'"><img class="face" src="uploads/faces/' + members.face + '"></a><div data-id="' + members._id + '" class="close">x</div></li>' +
                            '<li><small>' + date.getDate()+'日'+date.getHours()+'时'+date.getMinutes()+'分' + '</small><br/>'+message.message+'</li>'+
                            '</ul>');
                        $('#chat_title_' + members._id).click(function () {
                            $('.modal.chat .left-panel').find(".active").removeClass('active');
                            $(this).addClass('active');
                            $('.modal-body.message>ul.show').removeClass('show').addClass('hide');
                            $('#chat_content_' + $(this)[0].dataset.id).removeClass("hide").addClass("show");
                            //设置toId
                            $("#toId").val($(this)[0].dataset.id);
                        })
                        //关闭个人对话框
                        $('#chat_content_' + members._id).find('.close').click(function () {
//                        显示下一个content
                            $(this).next().removeClass('hide').addClass('show');
//                        显示下个title
                            $("#chat_title_" + $(this)[0].dataset.id).next().addClass('active');
//                        删除此title
                            $('#chat_title_' + $(this)[0].dataset.id).remove();
//                        删除此content
                            $('#chat_content_' + $(this)[0].dataset.id).remove();
                        })
                    }
                }

//            没有聊天的记录时候
                if ($('.modal.chat .left-panel').children().size() === 0) {
                    var date = new Date(message.date);
                    $('.modal.chat .left-panel').prepend('<div class="row active" data-id="' + members._id + '" id="chat_title_' + members._id + '"><span>' + members.nick + '</span></div>');
                    $('.modal.chat .left-panel').after('<ul id="chat_content_' + members._id + '" class="right-panel clearfloat show">' +
                        '<li class="right"><a href="/user/'+members._id+'"><img class="face" src="uploads/faces/' + members.face + '"></a><div data-id="' + members._id + '" class="close">x</div></li>' +
                        '<li><small>' + date.getDate()+'日'+date.getHours()+'时'+date.getMinutes()+'分' + '</small><br/>'+message.message+'</li>'+
                        '</ul>');
                    $('#chat_title_' + members._id).click(function () {
                        $('.modal.chat .left-panel').find(".active").removeClass('active');
                        $(this).addClass('active');
                        $('.modal-body.message>ul.show').removeClass('show').addClass('hide');
                        $('#chat_content_' + $(this)[0].dataset.id).removeClass("hide").addClass("show");
                        //设置toId
                        $("#toId").val($(this)[0].dataset.id);
                    })
                    //关闭个人对话框
                    $('#chat_content_' + members._id).find('.close').click(function () {
//                        显示下一个content
                        $(this).next().removeClass('hide').addClass('show');
//                        显示下个title
                        $("#chat_title_" + $(this)[0].dataset.id).next().addClass('active');
//                        删除此title
                        $('#chat_title_' + $(this)[0].dataset.id).remove();
//                        删除此content
                        $('#chat_content_' + $(this)[0].dataset.id).remove();
                    })
                    //第一次要设置toId
                    $("#toId").val(members._id);
                }
            }
        }
    }
}