'use strict';

angular.module('AccountCtrl', [])


.controller('AccountCtrl', ['$scope', 'authFactory', 'singleUsersFactory',
	'weeklyScoreFactory', 'mapFactory',
	function ($scope, authFactory, singleUsersFactory,
	weeklyScoreFactory, mapFactory) {
    
    $scope.username = '';
    $scope.getCurrentStreak     = getCurrentStreak;

    $scope.$on('recomputeDaysPerf', function () {
        console.log("!BROADCAST DETECTED!")
        recomputeFactory.generalRecompute();
    });

    retrieveAllHabits();
    
    if(authFactory.isAuthenticated()) {
        $scope.username = authFactory.getUsername();
    }

    function retrieveAllHabits()
    {
        singleUsersFactory.query({username: authFactory.getUsername()},
        function(response){
            $scope.allHabits = response.habits;
            $scope.weeklyScore = weeklyScoreFactory.computeWeeklyScore(response.habits);
        },
        function(response){
          //exception management
        });
    }

    function getCurrentStreak(habitid) {
        return mapFactory.getCurrentStreakData(habitid);
    }

}])
;