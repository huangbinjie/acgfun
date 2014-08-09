/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl', ['$scope', '$http', '$message', '$loadingBar', '$rootScope','Auth',
    function ($scope, $http, $message, $loadingBar, $rootScope,Auth) {
        $rootScope.showEditor = false;
        $rootScope.showOpenEditor = false;
        $rootScope.showCrumb = false;
        $scope.login = function () {
            $loadingBar("80%");
            $http.post("/login", {email: $scope.login_email, password: $scope.login_password}).success(function (data) {
                if (data.result === "success") {
                    location.href = "/";
                } else {
                    $message(data.msg !== undefined ? data.msg : "登陆失败", 90);
                }
            });
        }

        $scope.regist = function () {
            $loadingBar("80%");
            $http.post('/register', {nick: $scope.register_nick, email: $scope.register_email, password: $scope.register_password}).
                success(function (data) {
                    if (data.result === "success") {
                        $message("注册成功", 90);
                        $loadingBar("100%", success);
                    } else {
                        $message(data.msg !== undefined ? data.msg : "注册失败", 90);
                    }
                })
        }

        function success() {
            $("#register").slideUp(400, function () {
                $('#login').slideDown();
            });
        }
    }]);
app.controller('indexCtrl', ['$scope', '$rootScope', '$message', 'Auth',
    function ($scope, $rootScope, $message, Auth) {
    $rootScope.showEditor = false;
    $rootScope.showOpenEditor = false;
    $rootScope.showCrumb = false;
    Auth.isUser();
}])
app.controller('pageCtrl', ['$scope', '$rootScope', '$message', '$location', 'Post', 'Auth',
    function ($scope, $rootScope, $message, $location, Post, Auth) {
        $rootScope.showEditor = false;
        $rootScope.editType = "post";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        Auth.isUser();
        $scope.url = $location.path();
        Post($location.path()).list(function (data) {
            $scope.topics = data;
        })
    }])

app.controller('topicCtrl', ['$scope', '$rootScope','$location', 'Topic', 'Auth',
    function ($scope, $rootScope,$location, Topic, Auth) {
    $rootScope.editType = "reply";
    $rootScope.showOpenEditor = true;
    $rootScope.showCrumb = true;
    Auth.isUser();
    Topic($location.path()).get({}, function (data) {
        $scope.topic = data;
    })
}])