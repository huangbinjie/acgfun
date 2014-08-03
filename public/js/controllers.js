/**
 * Created by hbj on 2014/8/3.
 */
app.controller('loginCtrl',['$scope','$http','$message','$loadingBar',function($scope,$http,$message,$loadingBar){
    $scope.login = function(){
        $loadingBar("80%");
        $http.post("/login",{email:$scope.login_email,password:$scope.login_password}).success(function(data){
            if(data.result==="success"){
                $message("登陆成功",90);
                $loadingBar("100%","/");
            } else {
                $message(data.msg!==undefined?data.msg:"登陆失败",90);
            }
        });
    }
}]);