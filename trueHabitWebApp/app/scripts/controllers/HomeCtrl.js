'use strict';

angular.module('HomeCtrl', [])


.controller('HomeCtrl', ['$scope','$rootScope','$state','ngDialog','authFactory', 'recomputeFactory', 
    function ($scope,$rootScope,$state,ngDialog,authFactory,recomputeFactory) {
    
    $scope.loggedIn         = false;
    $scope.username         = '';
    $scope.openLogin        = openLogin;
    $scope.openRegister     = openRegister;
    $scope.openDashboard    = openDashboard;

    if(authFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = authFactory.getUsername();
    }

    function openLogin() {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };

    function openRegister() {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterCtrl" });
    };

    function openDashboard() {
        recomputeFactory.generalRecompute();
    };
    
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
        $state.go('app.dashboard');
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
        $state.go('app.dashboard');
    });

    $rootScope.$on('logout:Successful', function () {
        console.log("logout:Successful broadcasted and received by HomeCtrl");
        $scope.loggedIn = false;
        $scope.username = '';
        $state.go('app');
    });

}])

.controller('HeaderCtrl', ['$scope', '$state', '$rootScope', 
    'ngDialog', 'authFactory', 'recomputeFactory',
    function ($scope, $state, $rootScope, 
        ngDialog, authFactory,recomputeFactory) {

    $scope.loggedIn     = false;
    $scope.username     = '';
    $scope.openLogin    = openLogin;
    $scope.openMyAccount= openMyAccount;
    $scope.logOut       = logOut;
    $scope.stateis      = stateis;
    
    if(authFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = authFactory.getUsername();
    }
        
    function openLogin() {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };

    function openMyAccount(){
        recomputeFactory.generalRecompute();
    }
    
    function logOut() {
       authFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
    });

    $rootScope.$on('logout:Successful', function () {
        console.log("logout:Successful broadcasted and received by HomeCtrl");
        $scope.loggedIn = false;
        $scope.username = '';
        $state.go('app');
    });
    
    function stateis(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.loginData    = $localStorage.getObject('userinfo','{}');
    $scope.doLogin      = doLogin;
    $scope.openRegister = openRegister;

    function doLogin() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);
        authFactory.login($scope.loginData);
        ngDialog.close();
    };
    
    function openRegister() {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterCtrl" });
    };
    
}])

.controller('RegisterCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {

        authFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])

;