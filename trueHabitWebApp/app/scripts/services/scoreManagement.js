'use strict';

angular.module('scoreManagement', [])

.factory('weeklyScoreFactory', ['$rootScope','mapFactory','calendarFactory',
  function ($rootScope,mapFactory,calendarFactory) {

  var weeklyScoreFac = {};

  var maxScore;

  weeklyScoreFac.computeWeeklyScore = function(allHabits){
   
    maxScore = (allHabits.length)*7;
    var score = 0;
    
    var thisWeekRealDateArr = calendarFactory.compileAlwaysThisWeek();

    console.log("THIS WEEK REAL DATE ARR: ",thisWeekRealDateArr);
    console.log("TODAY DAY NB: ",calendarFactory.getTodayDayNb());
    var todayNb = calendarFactory.getTodayDayNb();

    allHabits.forEach(checkPerf);

    function checkPerf(habit, index){
        var habitid = habit._id;
        for(var dayNb=0; dayNb<=todayNb; dayNb++){
          var daydata = mapFactory.getPerfData(habitid, dayNb);
          console.log("day data: ",daydata);
          if (daydata==1)
          { 
            score++;
          }
        }
      //console.log("key: ",item.key," - value: ",item.value);
    }
    var completion = 0;
    if(maxScore != undefined){
      if (maxScore != 0){
        completion = Math.round((score/maxScore)*100);
      }
    }
    console.log("COMPLETION: ",completion,"%");

    return {score: score, maxScore: maxScore, completion: completion};
  };

  return weeklyScoreFac;
}])
;