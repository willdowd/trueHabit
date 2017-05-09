'use strict';

angular.module('AccountCtrl', [])


.controller('AccountCtrl', ['$scope', 'authFactory', function ($scope, authFactory) {
    $scope.username = '';
    
    if(authFactory.isAuthenticated()) {
        $scope.username = authFactory.getUsername();
    }
}])
;