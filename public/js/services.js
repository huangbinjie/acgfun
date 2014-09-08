/**
 * Created by hbj on 2014/8/3.
 */
app.factory('User', ['$resource', function ($resource) {
    return $resource("/user", {}, {
        query: {method: "GET"}
    });
}]);

app.factory('$message', function ($timeout) {
    var $message = function (message, top,time) {
        var width = ($("body").width() - $("#message").width()) / 2;
        $('#message').empty().append(message).css({"opacity": ".8", "left": width, "top": top !== undefined ? top : 100,"display":"block"});
        if(time!==0){
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
app.factory('Auth', function ($cookies, $rootScope, $http, $message,$location) {
    var auth = {
        getUser: function () {
            if (window.sessionStorage.User !== undefined) {
                $rootScope.User = JSON.parse(Base64.decode(window.sessionStorage.User));
            }
            return window.sessionStorage.User?JSON.parse(Base64.decode(window.sessionStorage.User)):{};
        },
        signOut: function () {
            $http.post("/signout").success(function (data) {
                if (data.result === "success") {
                    $message("成功退出");
                    $rootScope.User = window.sessionStorage.User;
                    ws.send(JSON.stringify({path:$location.path(),suffix:'/signOut',user:window.sessionStorage.User?JSON.parse(Base64.decode(window.sessionStorage.User)):{}}));
                    window.sessionStorage.removeItem("User");
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

app.factory('$crumb', function ($location, $rootScope,$escape) {
    return function (path) {
        $rootScope.crumbs = [];
        if (/^\/*/.test(path)) {
            $rootScope.crumbs.push("<a href='/'>主页</a>");
        }
        if (/^\/a.*/.test(path)) {
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/a'>动画</a>");
        }
        if(/^\/c.*/.test(path)){
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/c'>漫画</a>");
        }
        if(/^\/g.*/.test(path)){
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/g'>游戏</a>");
        }
        if(/^\/m.*/.test(path)){
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("<a href='/m'>音乐</a>");
        }
        if(/^\/[acgm]\/+.*/.test(path)){
            $rootScope.crumbs.push("/");
            var text = path.split("/").slice(-1)[0];
            $rootScope.crumbs.push($escape(text));
        }
        if(/^\/(user).*/.test(path)){
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("个人中心");
        }
    }
})

app.factory('$escape',function(){
    return function(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
})

app.factory('Star',function($resource){
    return $resource('/user/star', {}, {
        get: {method: "POST", isArray: false},
        add: {method: "PUT"},
        delete: {method: "DELETE"}
    })
})
app.factory('Follow',function($resource){
    return $resource('/user/follow', {}, {
        get: {method: "POST", isArray: false},
        add: {method: "PUT"},
        delete: {method: "DELETE"}
    })
})

//app.factory('$socket',function(){
//    var ws;
//    return {
//        start:function(){
//            ws = new WebSocket('ws://acgfun.cn');
//            var message = {};
//            var user = {};
//            ws.onopen = function(){
//                ws.onmessage = function(data){
//                    message = JSON.parse(data.data);
//                    user = JSON.parse(message.user);
//                    $(".chat-dialog").prepend('<li class="chat"><img src="uploads/faces/'+user.face+'"><span class="username">'+user.nick+':</span><span>'+message.message+'</span></li>');
//                }
//            }
//        },
//        stop:function(){
//            ws.close();
//        },
//        send:function(message){
//            ws.send(message);
//        }
//    }
//})