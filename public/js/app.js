/**
 * Created by hbj on 2014/8/3.
 */
var app = angular.module('acgfun', ['ngRoute','ngResource']);
app.config(['$routeProvider', '$locationProvider', '$httpProvider','$resourceProvider',
    function ($routeProvider, $locationProvider, $httpProvider,$resourceProvider) {
        $locationProvider.html5Mode(true);
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $resourceProvider.defaults.stripTrailingSlashes = false;

        $routeProvider.
            when('/',{
                templateUrl:'main.html'
            }).
            when('/login',{
                templateUrl:'login.html',
                controller:'loginCtrl'
            }).
            when('/a',{
                templateUrl:'animation.html'
            }).
            when('/b',{
                templateUrl:'animation.html'
            }).
            when('/c',{
                templateUrl:'animation.html'
            }).
            when('/d',{
                templateUrl:'animation.html'
            }).
            otherwise({redirecTo:'404.html'});
    }]).run(function($rootScope){

});