'use strict';

angular.module('HeaderCtrl', [])

.controller('HeaderCtrl', ['$scope', '$state', '$rootScope', 'ngDialog', 'authFactory', function ($scope, $state, $rootScope, ngDialog, authFactory) {

    $scope.loggedIn = false;
    $scope.username = '';


    
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

    //$scope.getCurrentUser = AuthFactory.getCurrentUser();        
    //console.log($scope.getCurrentUser);
    
}])

.controller('RegisterCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        authFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])
;
