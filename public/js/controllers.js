/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl', ['$scope', '$http', '$message', '$loadingBar', '$rootScope', '$location', 'Auth',
    function ($scope, $http, $message, $loadingBar, $rootScope, $location, Auth) {
        $rootScope.showEditor = false;
        $rootScope.showOpenEditor = false;
        $rootScope.showCrumb = false;
        $scope.login = function () {
            if ($scope.login_email === undefined || $scope.login_email === "") {
                $message("请填写邮箱", 90);
                return;
            }
            if ($scope.login_password === undefined || $scope.login_password === "") {
                $message("请填写密码", 90);
                return;
            }
            $loadingBar("80%");
            $http.post("/login", {email: $scope.login_email, password: $scope.login_password}).success(function (data) {
                if (data.result === "success") {
                    Auth.setUser(Base64.encode(JSON.stringify(data.user)));
                    $loadingBar("100%", "/");
                } else {
                    $message(data.msg !== undefined ? data.msg : "登陆失败", 90);
                }
            });
        }

        $scope.regist = function () {
            if ($scope.register_email === undefined || $scope.register_email === "") {
                $message("请填写邮箱", 90);
                return;
            }
            if ($scope.register_password === undefined || $scope.register_password === "") {
                $message("请填写密码", 90);
                return;
            }
            if ($scope.register_nick === undefined || $scope.register_nick === "") {
                $message("请填写昵称", 90);
                return;
            }
            $loadingBar("80%");
            $http.post('/register', {nick: $scope.register_nick, email: $scope.register_email, password: $scope.register_password}).
                success(function (data) {
                    if (data.result === "success") {
                        $message("注册成功,请前往邮箱激活账号<br/><a href='/user/reActive'>没有收到？</a>", 90, 0);
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
app.controller('mainCtrl', ['$scope', '$rootScope', '$message', 'Auth', '$loadingBar','$http',
    function ($scope, $rootScope, $message, Auth, $loadingBar,$http) {
        $rootScope.showEditor = false;
        $rootScope.showOpenEditor = false;
        $rootScope.showCrumb = false;
        $rootScope.showChat = false;
        Auth.getUser();

        $http.post('/home').success(function(data){
            $scope.main = data;
        })

        $http.post('/home/recent').success(function (data) {
            $scope.recents = data;
        })
        $http.post('/home/status').success(function (data) {
            $scope.status = data;
        })
        $http.post('/home/active').success(function (data) {
            $scope.actives = data;
        })

        $scope.$on('newTopic',function(){
            $http.post('/home/recent').success(function (data) {
                $scope.recents = data;
                $scope.status.postCount++;
            })
        })
        $scope.$on('newComment',function(){
            $http.post('/home').success(function(data){
                $scope.main = data;
                $scope.status.commentCount++;
            })
        })
    }])
app.controller('pageCtrl', ['$scope', '$rootScope', '$message', '$location', 'Post', 'Auth', '$loadingBar', '$crumb',
    function ($scope, $rootScope, $message, $location, Post, Auth, $loadingBar, $crumb) {
        $rootScope.showEditor = false;
        $rootScope.editType = "post";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        $rootScope.showChat = false;
        Auth.getUser();
        $crumb($location.path());
        $scope.url = $location.path();
        $scope.currentPage = 0;
        $scope.$on('postSuccess', function () {
            $scope.query(0);
        })

        $scope.query = function (skip) {
            Post($location.path()).list({skip: skip * 30}, function (data) {
                $scope.topics = data.posts;
                $scope.currentPage = skip;
                $scope.pageCounts = [];
                for (var i = 0; i < Math.ceil(data.count / 30); i++) {
                    $scope.pageCounts.push(i);
                }
                $scope.pagination = true;
                dis($scope.currentPage);
                window.scrollTo(0, 0);
                $loadingBar("100%");
            });
        }
        $scope.query(0);
        function dis() {
            if ($scope.pageCounts.length === 1) {
                $scope.left = false;
                $scope.right = false;
                return;
            }
            if ($scope.currentPage === 0) {
                $scope.left = false;
            } else {
                $scope.left = true;
            }
            if ($scope.currentPage >= $scope.pageCounts.length - 1) {
                $scope.right = false;
            } else {
                $scope.right = true;
            }
        }

        $scope.$on('newTopic',function(event,url){
            if($location.path().indexOf(url)){
                Post($location.path()).list({skip: $scope.currentPage * 30}, function (data) {
                    $scope.topics = data.posts;
                    $scope.pageCounts = [];
                    for (var i = 0; i < Math.ceil(data.count / 30); i++) {
                        $scope.pageCounts.push(i);
                    }
                    $scope.pagination = true;
                    dis($scope.currentPage);
                    $message("已刷新");
                });
            }
        })
    }])

app.controller('topicCtrl', ['$scope', '$rootScope', '$location', 'Topic', 'Auth', '$loadingBar', '$crumb', '$message', 'Follow', "Star",'$routeParams',
    function ($scope, $rootScope, $location, Topic, Auth, $loadingBar, $crumb, $message, Follow, Star,$routeParams) {
        $rootScope.editType = "comment";
        $rootScope.showOpenEditor = true;
        $rootScope.showCrumb = true;
        $rootScope.showEditor = false;
        $rootScope.showChat = false;
        Auth.getUser();
        $scope.User = $rootScope.User;
        $crumb($location.path());
        $scope.currentPage = 0;
        $scope.query = function (skip) {
            $scope.currentPage = skip;
            Topic($location.path()).get({skip: skip * 30}, function (data) {
                $scope.topic = data;
                $scope.pageCounts = [];
                for (var i = 0; i < Math.ceil($scope.topic.count / 30); i++) {
                    $scope.pageCounts.push(i);
                }
                $scope.pagination = true;
                dis($scope.currentPage);
                window.scrollTo(0, 0);
                $loadingBar("100%");
            })
        }
        $scope.query(0);
        $scope.$on('postSuccess', function () {
            $scope.query(0);
        })

        $scope.star = function (pid) {
            if (!window.sessionStorage.User) {
                $message("请先登录");
            }
            Star.add({pid: pid}, function (data) {
                if (data.result === "success") {
                    $message("收藏成功");
                    $("body").click();
                } else {
                    $message(data.msg ? data.msg : "收藏失败");
                }
            })
        }

        $scope.follow = function (uid) {
            if (!window.sessionStorage.User) {
                $message("请先登录");
            }
            Follow.add({uid: uid}, function (data) {
                if (data.result === "success") {
                    $message("关注成功");
                    $("body").click();
                } else {
                    $message(data.msg ? data.msg : "关注失败");
                }
            })
        }

        $scope.delete = function (id, itemType) {
            Topic($location.path()).delete({id: id, type: itemType}, function (data) {
                if (data.result === "success") {
                    $message("已删除");
                    if (itemType === "p") {
                        $location.path($location.path().substring(0, $location.path().lastIndexOf('/')));
                    }
                    if (itemType === "c") {
                        $("#" + id).remove();
                    }
                } else {
                    $message("删除失败");
                }
            })
        }

        function dis() {
            if ($scope.pageCounts.length === 1) {
                $scope.left = false;
                $scope.right = false;
                return;
            }
            if ($scope.currentPage === 0) {
                $scope.left = false;
            } else {
                $scope.left = true;
            }
            if ($scope.currentPage >= $scope.pageCounts.length - 1) {
                $scope.right = false;
            } else {
                $scope.right = true;
            }
        }

        $scope.$on('newComment',function(event,pid){
            if($routeParams.pid===pid){
                if($scope.currentPage===$scope.pageCounts.length-1){
                    Topic($location.path()).get({skip: $scope.currentPage * 30}, function (data) {
                        $scope.topic = data;
                        $scope.pageCounts = [];
                        for (var i = 0; i < Math.ceil($scope.topic.count / 30); i++) {
                            $scope.pageCounts.push(i);
                        }
                        $scope.pagination = true;
                        dis($scope.currentPage);
                        $message("已刷新");
                    })
                } else {
                    $message("有新评论");
                }
            }
        })
    }])
app.controller('userCtrl', ['$scope', '$location', 'User', '$loadingBar', '$rootScope', 'Auth', '$upload', '$message', '$crumb', '$routeParams', 'Follow',
    function ($scope, $location, User, $loadingBar, $rootScope, Auth, $upload, $message, $crumb, $routeParams, Follow) {
        $rootScope.showCrumb = true;
        $rootScope.showOpenEditor = false;
        $scope.showModal = false;
        $rootScope.showChatModal = false;
        Auth.getUser();
        $crumb($location.path());
        $scope.showChangeFace = $routeParams.uid ? false : true;
        User($location.path()).get({}, function (data) {
            $scope.userData = data;
        })

        $scope.onFileSelect = function ($files) {
            $scope.file = $files[0];
        }

        $scope.submit = function () {
            if ($scope.file === undefined) {
                $message("请选择文件");
                return;
            }
            $upload.upload({
                url: '/upload/face',
                method: 'POST',
                file: $scope.file
            }).progress(function (evt) {
                $(".progressbar").show().width(parseInt(100.0 * evt.loaded / evt.total) + "%");
            }).success(function (data, status, headers, config) {
                if (data.result === "success") {
                    $message("上传头像成功");
                    $scope.showModal = false;
                    $scope.userData.user.face = data.face + "?" + Date.now();
                    $rootScope.User.face = data.face + "?" + Date.now();
                    window.sessionStorage.User = Base64.encode(JSON.stringify($rootScope.User))
                    $('#file').val(null);
                    $scope.file = undefined;
                } else {
                    $message("上传头像失败了");
                }
            });
        }

        $scope.follow = function (uid, f) {
            if (!window.sessionStorage.User) {
                $message("请先登录");
            }
            if (f) {
                Follow.delete({uid: uid}, function (data) {
                    if (data.result === "success") {
                        $message("已取消关注");
                        $scope.userData.isFollowed = false;
                    } else {
                        $message(data.msg ? data.msg : "取消关注失败");
                    }
                })
            } else {
                Follow.add({uid: uid}, function (data) {
                    if (data.result === "success") {
                        $message("关注成功");
                        $scope.userData.isFollowed = true;
                    } else {
                        $message(data.msg ? data.msg : "关注失败");
                    }
                })
            }
        }
    }])

app.controller('activeCtrl', ['$scope', '$http', '$location', function ($scope, $http, $location) {
    $http.post('/user/active', $location.search()).success(function (data) {
        $scope.active = data.msg;
    })
}])

app.controller('reActiveCtrl', ['$scope', '$http', '$message', function ($scope, $http, $message) {
    $scope.send = function () {
        if ($scope.email === undefined || $scope.email === "") {
            $message("请填写邮箱", 90);
            return;
        }
        $http.post('/user/reActive', {email: $scope.email}).success(function (data) {
            if (data.result === "success") {
                $message("发送成功，请前往邮箱查收");
            } else {
                $message("发送失败");
            }
        })
    }
}])

app.controller('plazaCtrl', ['$scope', '$rootScope', 'Auth', '$http', function ($scope, $rootScope, Auth, $http) {
    $rootScope.showEditor = false;
    $rootScope.showOpenEditor = false;
    $rootScope.showCrumb = false;
    $rootScope.showChat = false;
    $scope.User = Auth.getUser();

    $http.post('/plaza/recent').success(function (data) {
        $scope.recents = data;
    })
    $http.post('/plaza/status').success(function (data) {
        $scope.status = data;
    })
    $http.post('/plaza/active').success(function (data) {
        $scope.actives = data;
    })
}])

app.controller('userTopicCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.currentPage = 0;
    $scope.query = function (skip) {
        $scope.currentPage = skip;
        $http.post('/user/topic', {skip: skip * 20}).success(function (data) {
            $scope.topics = data.topics;
            $scope.pageCounts = [];
            for (var i = 0; i < Math.ceil(data.count / 20); i++) {
                $scope.pageCounts.push(i);
            }
            $scope.pagination = true;
            dis($scope.currentPage);
        })
    }
    $scope.query(0);
    function dis() {
        if ($scope.pageCounts.length === 1) {
            $scope.left = false;
            $scope.right = false;
            return;
        }
        if ($scope.currentPage === 0) {
            $scope.left = false;
        } else {
            $scope.left = true;
        }
        if ($scope.currentPage >= $scope.pageCounts.length - 1) {
            $scope.right = false;
        } else {
            $scope.right = true;
        }
    }
}])

app.controller('userCommentCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.currentPage = 0;
    $scope.query = function (skip) {
        $scope.currentPage = skip;
        $http.post('/user/comment', {skip: skip * 20}).success(function (data) {
            $scope.comments = data.comments;
            $scope.pageCounts = [];
            for (var i = 0; i < Math.ceil(data.count / 20); i++) {
                $scope.pageCounts.push(i);
            }
            $scope.pagination = true;
            dis($scope.currentPage);
        })
    }
    $scope.query(0);
    function dis() {
        if ($scope.pageCounts.length === 1) {
            $scope.left = false;
            $scope.right = false;
            return;
        }
        if ($scope.currentPage === 0) {
            $scope.left = false;
        } else {
            $scope.left = true;
        }
        if ($scope.currentPage >= $scope.pageCounts.length - 1) {
            $scope.right = false;
        } else {
            $scope.right = true;
        }
    }
}])

app.controller('userReplyCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.replys = [];
    $scope.skip = 0;
    $scope.getReply = function(skip){
        $http.post('/user/reply', {skip: skip * 20}).success(function (data) {
            $scope.replys = $scope.replys.concat(data.reply);
            $scope.skip = skip;
        })
    }
    $scope.getReply(0);
}])

app.controller('userFollowCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.skip = 0;
    $scope.follows = []
    $scope.getFollow = function (skip) {
        $http.post('/user/follow', {skip: skip*20}).success(function (follows) {
            $scope.follows = $scope.follows.concat(follows);
            $scope.skip = skip;
        })
    }
    $scope.getFollow(0);
}])

app.controller('userEditCtrl', ['$scope', '$http','$message', function ($scope, $http,$message) {
    $http.post('/user/profile').success(function (profile) {
        $scope.profile = profile;
    })

    $scope.save = function () {
        $http.put('/user/profile', {profile: $scope.profile}).success(function (data) {
            if (data.result === "success") {
                $message('保存成功');
            } else {
                $message('保存失败');
            }
        })
    }

    $scope.reset = function () {
        if ($scope.password.currentPassword === undefined || $scope.password.currentPassword === "") {
            $message("请填写当前密码");
            return;
        }
        if ($scope.password.newPassword === undefined || $scope.password.newPassword === "") {
            $message("请填写新密码");
            return;
        }
        $http.post('/user/resetPass', $scope.password).success(function (data) {
            if (data.result === "success") {
                $message('修改成功');
                $scope.password = {};
            } else {
                if (data.msg) {
                    $message(data.msg);
                } else {
                    $message('修改失败');
                }
            }
        })
    }
}])