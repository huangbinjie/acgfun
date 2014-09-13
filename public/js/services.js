/**
 * Created by hbj on 2014/8/3.
 */
app.factory('User', ['$resource', function ($resource) {
    return $resource("/user", {}, {
        query: {method: "GET"}
    });
}]);

app.factory('$message', function ($timeout) {
    var $message = function (message, top, time) {
        var width = ($("body").width() - $("#message").width()) / 2;
        $('#message').empty().append(message).css({"opacity": ".8", "left": width, "top": top !== undefined ? top : 100, "display": "block"});
        if (time !== 0) {
            $timeout(function () {
                $('#message').css({"opacity": "0", "left": width, "top": -100});
            }, 3000);
        }
    };
    return $message;
});

app.factory('$loadingBar', function ($timeout, $location) {
    var load = function (width, fuc) {
        if (typeof(fuc) === "boolean" && fuc === true) {
        } else {
            $(".loading-bar").remove();
            $("#background-img").after("<div class='loading-bar'></div>");
        }
        $(".loading-bar").width(width);
        if (width === "100%") {
            $timeout(function () {
                $(".loading-bar").remove();
            }, 1000);
        }
        if (fuc instanceof Function) {
            fuc();
            return;
        }
        if (typeof(fuc) === "string") {
            $location.path(fuc);
        }
    }
    return load;
});

app.factory('Post', function ($resource, $rootScope) {
    return function (path) {
        return $resource(path, {}, {
            list: {method: "POST", isArray: false},
            add: {method: "PUT"},
            delete: {method: "DELETE"}
        })
    };
})
app.factory('Topic', function ($resource) {
    return function (path) {
        return $resource(path, {}, {
            get: {method: "POST", isArray: false},
            add: {method: "PUT"},
            delete: {method: "DELETE"}
        })
    };
})
app.factory('User', function ($resource) {
    return function (path) {
        return $resource(path, {}, {
            get: {method: "POST", isArray: false},
            add: {method: "PUT"},
            delete: {method: "DELETE"}
        })
    };
})
app.factory('Auth', function ($cookies, $rootScope, $http, $message, $location) {
    var auth = {
        getUser: function () {
            if (window.sessionStorage.User !== undefined) {
                $rootScope.User = JSON.parse(Base64.decode(window.sessionStorage.User));
            }
            return window.sessionStorage.User ? JSON.parse(Base64.decode(window.sessionStorage.User)) : {};
        },
        signOut: function () {
            $http.post("/signout").success(function (data) {
                if (data.result === "success") {
                    ws.send(JSON.stringify({path: $location.path(), suffix: '/signOut', user: window.sessionStorage.User ? JSON.parse(Base64.decode(window.sessionStorage.User)) : {}}));
                    window.sessionStorage.removeItem("User");
                    $rootScope.User = undefined;
                    $message("成功退出");
                } else {
                    $message("退出失败");
                }
            })
        },
        setUser: function (user) {
            window.sessionStorage.User = user;
        }
    }
    return auth;
})

app.factory('$crumb', function ($location, $rootScope, $escape) {
    return function (path) {
        $rootScope.crumbs = [];
        if (/^\/*/.test(path)) {
            $rootScope.crumbs.push("<a href='/'>主页</a>");
        }
        if (/^\/a.*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/a'>动画</a>");
        }
        if (/^\/c.*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/c'>漫画</a>");
        }
        if (/^\/g.*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/g'>游戏</a>");
        }
        if (/^\/m.*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/m'>音乐</a>");
        }
        if (/^\/[acgm]\/+.*/.test(path)) {
            $rootScope.crumbs.push("/");
            var text = path.split("/").slice(-1)[0];
            $rootScope.crumbs.push($escape(text));
        }
        if (/^\/(user).*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("个人中心");
        }
    }
})

app.factory('$escape', function () {
    return function (str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})

app.factory('Star', function ($resource) {
    return $resource('/user/star', {}, {
        get: {method: "POST", isArray: false},
        add: {method: "PUT"},
        delete: {method: "DELETE"}
    })
})
app.factory('Follow', function ($resource) {
    return $resource('/user/follow', {}, {
        get: {method: "POST", isArray: false},
        add: {method: "PUT"},
        delete: {method: "DELETE"}
    })
})

app.factory('$socket', function ($rootScope,$location) {
    var ws = new WebSocket('ws://localhost');
    var message = {};
    var user = {};
    var members = [];//在线用户组
    ws.onopen = function () {
        ws.onmessage = function (data) {
            message = JSON.parse(data.data);
            members = message.members;
            if ('/plaza' === message.path) {
                if (message.suffix === '/chat') {
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
            } else if (message.path === '/') {
                //新主题
                if (message.suffix === '/join/topic') {
                        $rootScope.$broadcast('newTopic',message.message);
                }
                //新评论
                if (message.suffix === '/join/comment') {
                        $rootScope.$broadcast('newComment',message.message);
                }
            }
            if (message.suffix === '/to') {
                $('audio')[0].play();
                if(!$rootScope.showChatModal){
                    $rootScope.$apply(function(){
                        ++$rootScope.chatCount;
                    })
                }
                //            有聊天记录的时候
                if ($('.modal.chat .left-panel').children().size() > 0) {
                    if ($("#chat_title_" + members._id).size() > 0) {
                        $("#chat_content_" + members._id).append('<li>' + message.message + '</li>');
                        $("#chat_content_" + members._id).scrollTop($("#chat_content_" + members._id)[0].scrollHeight);
                    } else {
                        var date = new Date(message.date);
                        $('.modal.chat .left-panel').prepend('<div class="row" data-id="' + members._id + '" id="chat_title_' + members._id + '"><span>' + members.nick + '</span></div>');
                        $('.modal.chat .left-panel').after('<ul id="chat_content_' + members._id + '" class="right-panel clearfloat hide">' +
                            '<li class="right"><a href="/user/' + members._id + '"><img class="face" src="uploads/faces/' + members.face + '"></a><div data-id="' + members._id + '" class="close">x</div></li>' +
                            '<li><small>' + date.getDate() + '号' + date.getHours() + '点' + date.getMinutes() + '分' + '</small><br/>' + message.message + '</li>' +
                            '</ul>');
                        $('#chat_title_' + members._id).click(function () {
                            $('.modal.chat .left-panel').find(".active").removeClass('active');
                            $(this).addClass('active');
                            $('.modal-body.message> ul').removeClass('show').addClass('hide');
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
                        '<li class="right"><a href="/user/' + members._id + '"><img class="face" src="uploads/faces/' + members.face + '"></a><div data-id="' + members._id + '" class="close">x</div></li>' +
                        '<li><small>' + date.getDate() + '日' + date.getHours() + '时' + date.getMinutes() + '分' + '</small><br/>' + message.message + '</li>' +
                        '</ul>');
                    $('#chat_title_' + members._id).click(function () {
                        $('.modal.chat .left-panel').find(".active").removeClass('active');
                        $(this).addClass('active');
                        $('.modal-body.message > ul').removeClass('show').addClass('hide');
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

            //加入主页
            if (message.suffix === '/join') {
                $('#onlineMembers').html(message.members);
                $('#onlineGuests').html(message.guests);
            }
            //更新在线状态
            if (message.suffix === '/join/member') {
                if (members.length === 0) return;
                $('#onlineMembers').html(parseInt($('#onlineMembers').html()) + 1);
                $("#online_" + members._id).removeClass('offline').addClass('online');
                if (members.face === undefined) members.face = "default.jpg";
                $('#plaza-groups').append('<li class="inline-block" id="' + members._id + '"><a href="/user/' + members._id + '"><img src="uploads/faces/' + members.face + '"></a><p class="text-center">' + members.nick + '</p></li>')
            }
            //更新离线状态
            if (message.suffix === '/left/member') {
                $('#onlineMembers').html(parseInt($('#onlineMembers').html()) - 1);
                $("#online_" + members._id).removeClass('online').addClass('offline');
                $('#' + members._id).remove();
            }
            //离开来宾
            if (message.suffix === '/left/guest') {
                $('#onlineGuests').html(parseInt($('#onlineGuests').html()) - 1);
            }
            //加入来宾
            if (message.suffix === '/join/guest') {
                $('#onlineGuests').html(parseInt($('#onlineGuests').html()) + 1);
            }
        }
    }
    return ws;
})