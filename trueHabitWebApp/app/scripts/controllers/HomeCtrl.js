'use strict';

angular.module('HomeCtrl', [])


.controller('HomeCtrl', ['$scope', 'ngDialog', function ($scope,ngDialog) {
    
    // $scope.loggedIn = false;
    // $scope.username = '';
    
    // if(AuthFactory.isAuthenticated()) {
    //     $scope.loggedIn = true;
    //     $scope.username = AuthFactory.getUsername();
    // }
    //ng-click="openLogin()"
    $scope.openLogin = function () {
        console.log("openLogin!");
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };
    
    // $rootScope.$on('login:Successful', function () {
    //     $scope.loggedIn = AuthFactory.isAuthenticated();
    //     $scope.username = AuthFactory.getUsername();
    // });
        
    // $rootScope.$on('registration:Successful', function () {
    //     $scope.loggedIn = AuthFactory.isAuthenticated();
    //     $scope.username = AuthFactory.getUsername();
    // });

}])
;