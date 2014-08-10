/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl', ['$scope', '$http', '$message', '$loadingBar', '$rootScope','$location', 'Auth',
    function ($scope, $http, $message, $loadingBar, $rootScope,$location, Auth) {
        $rootScope.showEditor = false;
        $rootScope.showOpenEditor = false;
        $rootScope.showCrumb = false;
        $scope.login = function () {
            if($scope.login_email===undefined||$scope.login_email===""){
                $message("请填写邮箱",90);
                return;
            }
            if($scope.login_password===undefined||$scope.login_password===""){
                $message("请填写密码",90);
                return;
            }
            $loadingBar("80%");
            $http.post("/login", {email: $scope.login_email, password: $scope.login_password}).success(function (data) {
                if (data.result === "success") {
                    Auth.setUser(data.user);
                    $loadingBar("100%");
                    $location.path("/");
                } else {
                    $message(data.msg !== undefined ? data.msg : "登陆失败", 90);
                }
            });
        }

        $scope.regist = function () {
            if($scope.register_email===undefined||$scope.register_email===""){
                $message("请填写邮箱",90);
                return;
            }
            if($scope.register_password===undefined||$scope.register_password===""){
                $message("请填写密码",90);
                return;
            }
            if($scope.register_nick===undefined||$scope.register_nick===""){
                $message("请填写昵称",90);
                return;
            }
            $loadingBar("80%");
            $http.post('/register', {nick: $scope.register_nick, email: $scope.register_email, password: $scope.register_password}).
                success(function (data) {
                    if (data.result === "success") {
                        $message("注册成功", 90);
                        $loadingBar("100%", success);
                    } else {
                        $message(data.msg !== undefined ? data.msg : "注册失败", 90);
                        $loadingBar("80%");
                    }
                })
        }

        function success() {
            $("#register").slideUp(400, function () {
                $('#login').slideDown();
            });
        }
    }]);
app.controller('indexCtrl', ['$scope', '$rootScope', '$message', 'Auth', '$loadingBar',
    function ($scope, $rootScope, $message, Auth, $loadingBar) {
        $rootScope.showEditor = false;
        $rootScope.showOpenEditor = false;
        $rootScope.showCrumb = false;
        Auth.getUser();
    }])
app.controller('pageCtrl', ['$scope', '$rootScope', '$message', '$location', 'Post', 'Auth', '$loadingBar','$crumb',
    function ($scope, $rootScope, $message, $location, Post, Auth, $loadingBar,$crumb) {
        $rootScope.showEditor = false;
        $rootScope.editType = "post";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        Auth.getUser();
        $crumb($location.path());
        $scope.url = $location.path();
        Post($location.path()).list(function (data) {
            $scope.topics = data;
        })
    }])

app.controller('topicCtrl', ['$scope', '$rootScope', '$location', 'Topic', 'Auth', '$loadingBar','$crumb',
    function ($scope, $rootScope, $location, Topic, Auth, $loadingBar,$crumb) {
        $rootScope.editType = "reply";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        Auth.getUser();
        $crumb($location.path());
        Topic($location.path()).get({}, function (data) {
            $scope.topic = data;console.log(data);
        })
    }])
app.controller('userCtrl', ['$scope', '$location', 'User', '$loadingBar', '$rootScope', 'Auth', '$upload','$message',
    function ($scope, $location, User, $loadingBar, $rootScope, Auth, $upload,$message) {
        $rootScope.showCrumb = true;
        $rootScope.showOpenEditor = true;
        $scope.showModal = false;
        Auth.getUser();
        User($location.path()).get({}, function (data) {
            $scope.userData = data;
            console.log(data);
        })

        $scope.onFileSelect = function ($files) {
            $scope.file = $files[0];
        }

        $scope.submit = function(){
            if($scope.file===undefined){
                $message("请选择文件");
                return;
            }
            $upload.upload({
                url: '/upload/face',
                method:'POST',
                file: $scope.file
            }).progress(function(evt) {
                $(".progressbar").show().width(parseInt(100.0 * evt.loaded / evt.total)+"%");
            }).success(function(data, status, headers, config) {console.log(data)
                if(data.result==="success"){
                    $message("上传头像成功");
                    $rootScope.showModal = false;
                    $scope.userData.user.face = data.face;
                } else {
                    $message("上传头像失败了");
                }
            });
        }
    }])