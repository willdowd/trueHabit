'use strict';

angular.module('habitManagement', [])
.constant("baseURL", "https://localhost:3443/")

.factory('habitFactory', ['$resource', '$state', 'baseURL', 'authFactory', 'singleUsersFactory',
 function ($resource, $state, baseURL, authFactory,singleUsersFactory) {
  
  var habitFac = {};
  
  habitFac.habitResource = function() {
    return $resource(baseURL + "habits/:habitid", {habitid:"@habitid"}, {
            'update': {
                method: 'PUT'
            }
        });
  };
  var allHabits;

  habitFac.deleteHabit = function(habitid) {
    $resource(baseURL + "habits/:habitid", {habitid:"@habitid"})
      .delete({habitid: habitid},null,function(response){
        $state.reload();
      });
  };

  habitFac.habitResourceFromHabitid = function() {
    return $resource(baseURL + "habits/:habitid", null, {
            'update': {
              method: 'PUT'
            },
            'query':  {method:'GET', isArray:false}
    });
  };

  return habitFac;

}])

.factory('newHabitFactory', ['$resource', '$state', 'baseURL', 'habitFactory', 
  function ($resource, $state, baseURL, habitFactory) {
  
  var newHabitFac = {
  };

  newHabitFac.addHabit = function(newHabit) {

    habitFactory.habitResource().save(
      newHabit, 
      function(response){
        $state.reload();
      },
      function(response){
      });
  };

  return newHabitFac;

}])


.factory('mapFactory', ['$resource', 'baseURL', 'habitFactory', 'authFactory', 
  'singleUsersFactory','calendarFactory','statDateFactory',
  'statisticFactory', '$state', 
  function ($resource, baseURL,habitFactory,authFactory,
    singleUsersFactory,calendarFactory,statDateFactory,
    statisticFactory,$state) {

  var performanceMap = [];

  var mapFac = {};

  mapFac.makeKey = function(habitid, dayNb){
    return habitid.toString()+dayNb.toString();
  };

  mapFac.getMapSize = function(){
    return performanceMap.length;
  }

  mapFac.pushPerfData = function(habitid, dayNb, perf){
    
    var mapkey = mapFac.makeKey(habitid, dayNb);
    
    function findIndexVal(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    
    var index = performanceMap.findIndex(findIndexVal);
    //console.log("index: ",index);
    
    if (index == -1){
      //console.log("push in performance Map -  mapkey: ",mapkey," - value: ",perf);
      performanceMap.push({key: mapkey, value: perf});
    }
    performanceMap[index] = ({key: mapkey, value: perf});
  };


  mapFac.getPerfData = function(habitid, dayNb){
    
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

  mapFac.mafunctionadoree = function(){
    var keyarr = [];
    var valuearr = [];
    performanceMap.forEach(myfunc);
    function myfunc(item, index){
      keyarr.push(item.key);
      valuearr.push(item.value);
      //console.log("key: ",item.key," - value: ",item.value);
    }
    console.log("ADOREE: KEYS: ",keyarr);
    console.log("ADOREE: VALS: ",valuearr);
  };


  return mapFac;

  }])



  .factory('recomputeFactory', ['$resource', 'baseURL', 'habitFactory', 'authFactory', 
  'singleUsersFactory','calendarFactory','statDateFactory',
  'statisticFactory', '$state', 'mapFactory',
  function ($resource, baseURL,habitFactory,authFactory,
    singleUsersFactory,calendarFactory,statDateFactory,
    statisticFactory,$state,mapFactory) {

  var recomputeFac = {};

  recomputeFac.generalRecompute = function(){

    calendarFactory.compileViewDates();
    var username = authFactory.getUsername();
    singleUsersFactory.query({username: username},
        
      function(response){

      var allHabits = response.habits;

      var arrayofdates = calendarFactory.getRealDateArray();

      for (var i = 0; i < allHabits.length; i++){
        var obj = allHabits[i];
        //$scope.toRecompute[obj._id] = false;
        for (var dayNb = 0; dayNb < 7; dayNb++){
          // var myhabitid = obj._id;
          // var myhabitdate = dn;
          // var myhabitkey = mapFactory.makeKey(obj._id,dn);
          // console.log("RECOMPUTE - my HABIT KEY: ",myhabitkey);
          var statdate = statDateFactory.makeStatDate(arrayofdates[dayNb]);

          getStatAndPopulateMap(obj._id,statdate,dayNb,i,allHabits.length);

        }
    }
  },function(response){

  });

  };



  var getStatAndPopulateMap = function(habitid,statdate,dayNb,i,length){

    statisticFactory.getStatistic().query({habitid: habitid, statdate: statdate},
      function(response){
          if (response.value != undefined){
              mapFactory.pushPerfData(habitid, dayNb, response.value);
              if (  (i == (length-1)) && dayNb == 6)
              {
                console.log("!!!END OF THE RECOMPUTE - SIMPLE!!!");
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
                      //console.log("--> SAVE_STATE_DURING_RECOMPUTING - value: ",response.value," - date: ",statdate);
                      mapFactory.pushPerfData(habitid, dn, response.value);
                      //mapFactory.mafunctionadoree();
                      //$state.reload();

                      console.log("i: ",i," - dn: ",dayNb);
                      if (  (i == (length-1)) && dayNb == 6)
                      {
                        console.log("!!!END OF THE RECOMPUTE - COMPLEX!!!");
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

  return recomputeFac;

  }])


.factory('statDateFactory', ['$resource', 'baseURL', 'moment', 
  function ($resource, baseURL, moment) {

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

.factory('statisticFactory', ['$resource', 'baseURL',
 function ($resource, baseURL) {


  var statFac = {};

  statFac.resetStatistics = function(habitid) {
    var resource = $resource(baseURL + "habits/:habitid/statistic", {habitid:"@habitid"})
      .delete({habitid: habitid},null,function(response){
        $state.reload();
      });
  };

  statFac.getStatistic = function(){
    
    //console.log("getStatistic in StatisticFactory");
    return $resource(baseURL + "habits/:habitid/statistic/:statdate", 
      null,//{habitid:"@habitid", statdate: "@statdate"},
      {'update': {method: 'PUT'},
      'save': {method: 'POST'},
      'query': {method:'GET', isArray:false}
    });
  };

  return statFac;

}])


.factory('multiUsersFactory', ['$resource', 'baseURL', function ($resource, baseURL) {
  return $resource(baseURL + "users/:username", null, {
      'update': {
          method: 'PUT'
      }
  });
}])

.factory('singleUsersFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


  return $resource(baseURL + "users/:username", null, {
      'update': {
          method: 'PUT'
      },
      'query':  {method:'GET', isArray:false}
  });
}])
;