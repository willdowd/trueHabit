'use strict';

angular.module('scoreManagement', [])

.factory('weeklyScoreFactory', ['$rootScope',
  function ($rootScope) {



  var weeklyScoreFac = {};



  weeklyScoreFac.computeWeeklyScore = function(){
    console.log("scoreManagement - weeklyScoreFactory - computeWeeklyScore");
    return 10;
  };



  return weeklyScoreFac;
}])
;