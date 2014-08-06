/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl',['$scope','$http','$message','$loadingBar',function($scope,$http,$message,$loadingBar){
    $scope.login = function(){
        $loadingBar("80%");
        $http.post("/login",{email:$scope.login_email,password:$scope.login_password}).success(function(data){
            if(data.result==="success"){
                $message("登陆成功",90);
                $loadingBar("100%","/main");
            } else {
                $message(data.msg!==undefined?data.msg:"登陆失败",90);
            }
        });
    }

    $scope.regist = function(){
        $loadingBar("80%");
        $http.post('/register',{nick:$scope.register_nick,email:$scope.register_email,password:$scope.register_password}).
            success(function(data){
                if(data.result==="success"){
                    $message("注册成功",90);
                    $loadingBar("100%",success);
                } else {
                    $message(data.msg!==undefined?data.msg:"注册失败",90);
                }
            })
    }

    function success(){
            $("#register").slideUp(400, function () {
                $('#login').slideDown();
            });
            $("#login").slideUp(400,function(){
                $('#register').slideDown();
            });
    }
}]);