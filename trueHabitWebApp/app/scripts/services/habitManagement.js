'use strict';

angular.module('habitManagement', [])
.constant("baseURL", "https://localhost:3443/")

.factory('habitFactory', ['$resource', '$state', 'baseURL', '$rootScope',
 function ($resource, $state, baseURL,$rootScope) {
  
  var habitFac = {
    deleteHabit: deleteHabit,
    habitResourceFromHabitid: habitResourceFromHabitid,
    addHabit: addHabit
  };

  return habitFac;

  function addHabit(newHabit) {
    $resource(baseURL + "habits/:habitid", null)
    .save(newHabit, function(response){
      $state.reload();
      },function(response){
    });
  };

  function deleteHabit(habitid) {
    $resource(baseURL + "habits/:habitid", {habitid:"@habitid"})
      .delete({habitid: habitid},null,function(response){
        $rootScope.$broadcast('recomputeDaysPerf');
      });
  };

  function habitResourceFromHabitid() {
    return $resource(baseURL + "habits/:habitid", null, {
            'update': {
              method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
    });
  };

}])


.factory('mapFactory', [ 
  function () {

  var performanceMap = [];
  var bestStreakArray = [];
  var currentStreakArray = [];

  var mapFac = {
    makeKey: makeKey,
    getMapSize: getMapSize,
    pushPerfData: pushPerfData,
    getPerfData: getPerfData,
    getCurrentStreakData: getCurrentStreakData,
    pushCurrentStreakData: pushCurrentStreakData
  };
  return mapFac;

  function makeKey(habitid, dayNb){
    return habitid.toString()+dayNb.toString();
  };

  function getMapSize(){
    return performanceMap.length;
  };

  function pushPerfData(habitid, dayNb, perf){
    var mapkey = mapFac.makeKey(habitid, dayNb);
    function findIndexVal(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    var index = performanceMap.findIndex(findIndexVal);
    if (index == -1){
      performanceMap.push({key: mapkey, value: perf});
    }
    performanceMap[index] = ({key: mapkey, value: perf});
  };

  function getPerfData(habitid, dayNb){
    var mapkey = mapFac.makeKey(habitid, dayNb);
    function findval(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    var foundItem = performanceMap.find(findval);
    if (foundItem == undefined){
      return 0;
    }
    return foundItem.value;
  };

  function getCurrentStreakData(habitid){
    function findval(item){
      return (item.key.localeCompare(habitid)==0);
    }
    var foundItem = currentStreakArray.find(findval);
    if(foundItem != undefined){
      return foundItem.value;
    }
    else return 0;
  };

  function pushCurrentStreakData(habitid, perf){
    function findIndexVal(item){
      return (item.key.localeCompare(habitid)==0);
    }
    var index = currentStreakArray.findIndex(findIndexVal);
    if (index == -1){
      currentStreakArray.push({key: habitid, value: perf});
    }
    currentStreakArray[index] = ({key: habitid, value: perf});
  };

}])


.factory('recomputeFactory', ['authFactory', 
'singleUsersFactory','calendarFactory','statDateFactory',
'statisticFactory', '$state', 'mapFactory',
function (authFactory,
  singleUsersFactory,calendarFactory,statDateFactory,
  statisticFactory,$state,mapFactory) {

  var getStatAndPopulateMap = getStatAndPopulateMap;
  var calculateStreakReccurent = calculateStreakReccurent;

  var recomputeFac = {
    generalRecompute: generalRecompute,
    recomputeStreaks: recomputeStreaks
  };

  return recomputeFac;


  function generalRecompute(){
    calendarFactory.compileViewDates();
    var username = authFactory.getUsername();
    singleUsersFactory.query({username: username},
    function(response){
      var allHabits = response.habits;
      var arrayofdates = calendarFactory.getRealDateArray();
      for (var i = 0; i < allHabits.length; i++){
        var obj = allHabits[i];
        for (var dayNb = 0; dayNb < 7; dayNb++){
          var statdate = statDateFactory.makeStatDate(arrayofdates[dayNb]);
          getStatAndPopulateMap(obj._id,statdate,dayNb,i,allHabits.length);
        }
      }
    },function(response){
    });

  };

  function getStatAndPopulateMap(habitid,statdate,dayNb,i,length){

    statisticFactory.getStatistic().query({habitid: habitid, statdate: statdate},
      function(response){
          if (response.value != undefined){
              mapFactory.pushPerfData(habitid, dayNb, response.value);
              if (  (i == (length-1)) && dayNb == 6)
              {
                console.log("END OF THE RECOMPUTE - SIMPLE");
                recomputeStreaks();
                $state.reload();
              }
          }
          if (response.value == undefined){
              var newStatistic = {
                  date: statdate,
                  value: 0
              };
              statisticFactory.getStatistic().save({habitid: habitid, statdate: statdate}, newStatistic,
                  function(response){
                      mapFactory.pushPerfData(habitid, dn, response.value);

                      console.log("i: ",i," - dn: ",dayNb);
                      if (  (i == (length-1)) && dayNb == 6)
                      {
                        console.log("END OF THE RECOMPUTE - COMPLEX");
                        recomputeStreaks();
                        $state.reload();
                      }
                  },
                  function(response){
                  }
              );
          }
      },
      function(response){
          //$scope.message = "Error: " + response.status + " " + response.statusText;
      }
    );
  };

  function recomputeStreaks(){
    console.log("RECOMPUTE STREAK");
    var username = authFactory.getUsername();
    singleUsersFactory.query({username: username},
        
      function(response){

      var allHabits = response.habits;
      for (var i = 0; i < allHabits.length; i++){
        var habit = allHabits[i];
        var currentstreak = 0;
        var currentStreak = calculateStreakReccurent(habit._id,new Date(),currentstreak);
      }

  },function(response){
  });
  };

  function calculateStreakReccurent(habitid,date,streak){
    var statdate = statDateFactory.makeStatDate(date);
    var streakperf = streak;

    statisticFactory.getStatistic().query({habitid: habitid, statdate: statdate},
      function(response){
          if (response.value != undefined){
              if(response.value == 1){
                streakperf++;
                var newDate = date;
                newDate.setDate(date.getDate()-1);
                return streakperf + calculateStreakReccurent(habitid,newDate,streakperf);
              }
          }
          if (response.value == undefined){
            console.log("REC - GET STAT undefined - streakperf is the final current streak: ",streakperf);
            mapFactory.pushCurrentStreakData(habitid,streakperf);
            return 0;
          }
          console.log("REC - GET STAT return val 0 - streakperf is the final current streak: ",streakperf);
          mapFactory.pushCurrentStreakData(habitid,streakperf);
          return 0;
      },
      function(response){
          //$scope.message = "Error: " + response.status + " " + response.statusText;
      }
    );
  };

}])


.factory('statDateFactory', ['$resource', 'moment', 
  function ($resource, moment) {

  var statDateFac = {};

  statDateFac.makeStatDate = function(dateForStat){
    var momentdate = moment(dateForStat)
      .startOf('day')
      .format("YYYY/MM/DD");
    if(momentdate != undefined)
      return momentdate.toString();
  };
  return statDateFac;
}])


.factory('statisticFactory', ['$resource', 'baseURL','$rootScope',
 function ($resource, baseURL,$rootScope) {

  var getCurrentStreakResource = getCurrentStreakResource;

  var statFac = {
    resetStatistics: resetStatistics,
    getStatistic: getStatistic,
    getCurrentStreak: getCurrentStreak,
    updateCurrentStreak: updateCurrentStreak
  };

  return statFac;

  function resetStatistics(habitid) {
    $resource(baseURL + "habits/:habitid/statistic", {habitid:"@habitid"})
      .delete({habitid: habitid},null,function(response){
        $rootScope.$broadcast('recomputeDaysPerf');
      });
  };

  function getStatistic(){
    return $resource(baseURL + "habits/:habitid/statistic/:statdate", 
      null,
      {'update': {method: 'PUT'},
      'save': {method: 'POST'},
      'query': {method:'GET', isArray:false}
    });
  };

  function getCurrentStreak(habitid) {
    statFac.getCurrentStreakResource().query({habitid: habitid},null,function(response){
      console.log("GET CURRENT STREAK SUCCESSFUL: ",response);
      return response;
    })
  };

  function updateCurrentStreak(habitid,streaknb) {
    statFac.getCurrentStreakResource().update({habitid: habitid, streaknb: streaknb},null,function(response){
      console.log("UPDATE CURRENT STREAK SUCCESSFUL");
    })
  };

  function getCurrentStreakResource(){
    return $resource(baseURL + "habits/:habitid/currentstreak/:streaknb",
      null,
      {'update': {method: 'PUT'},
      'query': {method: 'GET', isArray:false}
    });
  };

}])


.factory('singleUsersFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

  return $resource(baseURL + "users/:username", null, {
      'query':  {method:'GET', isArray:false}
  });
  
}])
;