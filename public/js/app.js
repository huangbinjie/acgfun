/**
 * Created by hbj on 2014/8/3.
 */
var app = angular.module('acgfun', ['ngRoute','ngResource','ngCookies','angularFileUpload']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider','$resourceProvider',
    function ($routeProvider, $locationProvider, $httpProvider,$resourceProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $resourceProvider.defaults.stripTrailingSlashes = false;

        $routeProvider.
            when('/',{
                templateUrl:'main.html',
                controller:'mainCtrl'
            }).
            when('/login',{
                templateUrl:'login.html',
                controller:'loginCtrl'
            }).
            when('/[acgm]',{
                templateUrl:'page.html',
                controller:'pageCtrl'
            }).
            when('/[acgm]/:pid/:title',{
                templateUrl:'topic.html',
                controller:'topicCtrl'
            }).
            when('/user',{
                templateUrl:'user.html',
                controller:'userCtrl'
            }).
            when('/user/active',{
                templateUrl:'active.html',
                controller:'activeCtrl'
            }).
            when('/user/reActive',{
                templateUrl:'reActive.html',
                controller:'reActiveCtrl'
            }).
            when('/user/:uid',{
                templateUrl:'user.html',
                controller:'userCtrl'
            }).
            when('/plaza',{
                templateUrl:'plaza.html',
                controller:'plazaCtrl'
            }).
            otherwise({
                templateUrl:'404.html'
            });
    }]).run(function($rootScope,Auth,$loadingBar,$anchorScroll,$location,$routeParams,$timeout){
    $rootScope.signOut = Auth.signOut;
    $rootScope.$on("$viewContentLoaded",function(){
        $loadingBar("100%",true);
    })
    $rootScope.$on('$routeChangeSuccess', function(newRoute, oldRoute) {
        if($routeParams.scrollTo){
            $location.hash($routeParams.scrollTo);
            $timeout(function(){
                $anchorScroll();
            },1000)
        }
    });
    setTimeout(function(){
        var i = setInterval(function(){
            if(socketed){
                ws.send(JSON.stringify({path:$location.path(),user:Auth.getUser()}));
                clearInterval(i);
            }
        },1000)
    },1000);
});