'use strict';

angular.module('HomeCtrl', [])


.controller('HomeCtrl', ['$scope','$rootScope','$state','ngDialog','authFactory', 'mapFactory', 
    function ($scope,$rootScope,$state,ngDialog,authFactory,mapFactory) {
    
    $scope.loggedIn = false;
    $scope.username = '';
    

    console.log("HomeCtrl: isAuthenticated call");
    if(authFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = authFactory.getUsername();
    }

    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };

    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterCtrl" });
    };

    $scope.openDashboard = function () {
        console.log("OPEN DASHBOARD CALLED");
        mapFactory.recompute();
        //$rootScope.$broadcast('recomputeDaysPerf');
        //authFactory.recompute();
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
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = '';
        $state.go('app');
    });

}])

.controller('HeaderCtrl', ['$scope', '$state', '$rootScope', 'ngDialog', 'authFactory', function ($scope, $state, $rootScope, ngDialog, authFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    console.log("HeaderCtrl: isAuthenticated call");
    if(authFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = authFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };
    
    $scope.logOut = function() {
       authFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
        console.log("ON LOGIN SUCCESSFUL BROADCAST FIRST COMPUTE");
        //$rootScope.$broadcast('firstCompute');
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        authFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
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