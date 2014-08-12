/**
 * Created by hbj on 2014/8/3.
 */
app.factory('User', ['$resource', function ($resource) {
    return $resource("/user", {}, {
        query: {method: "GET"}
    });
}]);

app.factory('$message', function ($timeout) {
    var $message = function (message, top) {
        var width = ($("body").width() - $("#message").width()) / 2;
        $('#message').html(message).css({"opacity": ".8", "left": width, "top": top !== undefined ? top : 100});
        $timeout(function () {
            $('#message').css({"opacity": "0", "left": width, "top": -100});
        }, 3000);
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
            path();
            return;
        }
        if (typeof(fuc) === "string") {
            $location.path(path);
        }
    }
    return load;
});

app.factory('Post', function ($resource, $rootScope) {
    return function (path) {
        return $resource(path, {}, {
            list: {method: "POST", isArray: true},
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
app.factory('Auth', function ($cookies, $rootScope, $http, $message) {
    var auth = {
        getUser: function () {
            if (window.sessionStorage.User !== undefined) {
                $rootScope.User = JSON.parse(window.sessionStorage.User);
            }
        },
        signOut: function () {
            $http.post("/signout").success(function (data) {
                if (data.result === "success") {
                    $message("成功推出");
                    window.sessionStorage.removeItem("User");
                    $rootScope.User = undefined;
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

app.factory('$crumb', function ($location, $rootScope) {
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
            $rootScope.crumbs.push("<a href='.c'>漫画</a>");
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
            $rootScope.crumbs.push(path.split("/").slice(-1)[0]);
        }
        if(/^\/(user).*/.test(path)){
            $rootScope.crumbs.push("/");
            $rootScope.crumbs.push("个人中心");
        }
    }
})