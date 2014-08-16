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
                    Auth.setUser(JSON.stringify(data.user));
                    $loadingBar("100%","/");
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
                        $message("注册成功,请前往邮箱激活账号<br/><a href='/user/reActive'>没有收到？</a>", 90);
                        $loadingBar("100%", success);
                    } else {
                        $message(data.msg !== undefined ? data.msg : "注册失败", 90);
                        $loadingBar("80%");
                    }
                })
        }

        aaa = function(){
            alert("111");
        }

        function success() {
            $("#register").slideUp(400, function () {
                $('#login').slideDown();
            });
        }
    }]);
app.controller('mainCtrl', ['$scope', '$rootScope', '$message', 'Auth', '$loadingBar',
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
        $scope.currentPage = 0;
        $scope.$on('postSuccess',function(){
            $scope.query(0);
        })

        $scope.query = function(skip){
            Post($location.path()).list(function (data) {
                $scope.topics = data.posts;

                $scope.pageCounts = [];
                for (var i = 0; i < Math.ceil(data.count / 30); i++) {
                    $scope.pageCounts.push(i);
                }
                $scope.pagination = true;
                dis($scope.currentPage);
                window.scrollTo(0,0);
                $loadingBar("100%");
            });
        }
        $scope.query(0);
        function dis() {
            if($scope.pageCounts.length===1){
                $scope.left = false;
                $scope.right = false;
                return;
            }
            if ($scope.currentPage === 0) {
                $scope.left = false;
            } else {
                $scope.left = true;
            }
            if ($scope.currentPage >= $scope.pageCounts.length) {
                $scope.right = false;
            } else {
                $scope.right = true;
            }
        }
    }])

app.controller('topicCtrl', ['$scope', '$rootScope', '$location', 'Topic', 'Auth', '$loadingBar','$crumb','$message','Follow',"Star",
    function ($scope, $rootScope, $location, Topic, Auth, $loadingBar,$crumb,$message,Follow,Star) {
        $rootScope.editType = "reply";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        $rootScope.showEditor = false;
        Auth.getUser();
        $scope.User = $rootScope.User;
        $crumb($location.path());
        $scope.currentPage = 0;
        $scope.query = function(skip){
            $scope.currentPage = skip;
            Topic($location.path()).get({skip:skip*30}, function (data) {
                $scope.topic = data;
                $scope.pageCounts = [];
                for (var i = 0; i < Math.ceil($scope.topic.count / 30); i++) {
                    $scope.pageCounts.push(i);
                }
                $scope.pagination = true;
                dis($scope.currentPage);
                window.scrollTo(0,0);
                $loadingBar("100%");
            })
        }
        $scope.query(0);
        $scope.$on('postSuccess',function(){
            $scope.query(0);
        })

        $scope.star = function(pid){
            Star.add({pid:pid},function(data){
                if(data.result==="success"){
                    $message("收藏成功");
                    $("body").click();
                } else {
                    $message(data.msg?data.msg:"收藏失败");
                }
            })
        }

        $scope.follow = function(uid){
            Follow.add({uid:uid},function(data){
                if(data.result==="success"){
                    $message("关注成功");
                    $("body").click();
                } else {
                    $message(data.msg?data.msg:"关注失败");
                }
            })
        }

        $scope.delete = function(id,itemType){
            Topic($location.path()).delete({id:id,type:itemType},function(data){
                if(data.result==="success"){
                    $message("已删除");
                    if(itemType==="p"){
                        $location.path($location.path().substring(0,$location.path().lastIndexOf('/')));
                    }
                    if(itemType==="c"){
                        $("#"+id).remove();
                    }
                } else {
                    $message("删除失败");
                }
            })
        }

        function dis() {
            if($scope.pageCounts.length===1){
                $scope.left = false;
                $scope.right = false;
                return;
            }
            if ($scope.currentPage === 0) {
                $scope.left = false;
            } else {
                $scope.left = true;
            }
            if ($scope.currentPage >= $scope.pageCounts.length-1) {
                $scope.right = false;
            } else {
                $scope.right = true;
            }
        }
    }])
app.controller('userCtrl', ['$scope', '$location', 'User', '$loadingBar', '$rootScope', 'Auth', '$upload','$message','$crumb','$routeParams',
    function ($scope, $location, User, $loadingBar, $rootScope, Auth, $upload,$message,$crumb,$routeParams) {
        $rootScope.showCrumb = true;
        $rootScope.showOpenEditor = false;
        $scope.showModal = false;
        Auth.getUser();
        $crumb($location.path());
        $scope.showChangeFace = $routeParams.uid?false:true;
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
                    $rootScope.User.face = data.face;
                    window.sessionStorage.User = JSON.stringify($rootScope.User);
                } else {
                    $message("上传头像失败了");
                }
            });
        }
    }])

app.controller('activeCtrl',['$scope','$http','$location',function($scope,$http,$location){
    $http.post('/user/active',$location.search()).success(function(data){
        $scope.active = data.msg;
    })
}])

app.controller('reActiveCtrl',['$scope','$http','$message',function($scope,$http,$message){
    $scope.send = function(){
        if($scope.email===undefined||$scope.email===""){
            $message("请填写邮箱",90);
            return;
        }
        $http.post('/user/reActive',{email:$scope.email}).success(function(data){
            if(data.result==="success"){
                $message("发送成功，请前往邮箱查收");
            } else {
                $message("发送失败");
            }
        })
    }
}])