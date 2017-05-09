'use strict';

angular.module('accountController', [])


.controller('AccountController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.username = AuthFactory.getUsername();
    }
}])
;