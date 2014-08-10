/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl', ['$scope', '$http', '$message', '$loadingBar', '$rootScope', 'Auth',
    function ($scope, $http, $message, $loadingBar, $rootScope, Auth) {
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
        Auth.isUser();
    }])
app.controller('pageCtrl', ['$scope', '$rootScope', '$message', '$location', 'Post', 'Auth', '$loadingBar',
    function ($scope, $rootScope, $message, $location, Post, Auth, $loadingBar) {
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

app.controller('topicCtrl', ['$scope', '$rootScope', '$location', 'Topic', 'Auth', '$loadingBar',
    function ($scope, $rootScope, $location, Topic, Auth, $loadingBar) {
        $rootScope.editType = "reply";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        Auth.isUser();
        Topic($location.path()).get({}, function (data) {
            $scope.topic = data;
        })
    }])
app.controller('userCtrl', ['$scope', '$location', 'User', '$loadingBar', '$rootScope', 'Auth', '$upload','$message',
    function ($scope, $location, User, $loadingBar, $rootScope, Auth, $upload,$message) {
        $rootScope.showCrumb = true;
        $rootScope.showOpenEditor = true;
        $scope.showModal = false;
        Auth.isUser();
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