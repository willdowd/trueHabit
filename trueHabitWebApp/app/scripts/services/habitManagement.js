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


  mapFac.pushPerfData = function(habitid, dayNb, perf){
    
    var mapkey = mapFac.makeKey(habitid, dayNb);
    
    function findIndexVal(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    
    var index = performanceMap.findIndex(findIndexVal);
    //console.log("index: ",index);
    
    if (index == -1){
      console.log("push in performance Map -  mapkey: ",mapkey," - value: ",perf);
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


      console.log("RECOMPUTE - ALLHABITS: ",allHabits);

      var arrayofdates = calendarFactory.getRealDateArray();
      console.log("RECOMPUTE - ARRAY OF DATES: ",arrayofdates);

      for (var i = 0; i < allHabits.length; i++){
        console.log("i: ",i);
        var obj = allHabits[i];
        //$scope.toRecompute[obj._id] = false;
        for (var dayNb = 0; dayNb < 7; dayNb++){
          console.log("dn: ",dayNb);
          // var myhabitid = obj._id;
          // var myhabitdate = dn;
          // var myhabitkey = mapFactory.makeKey(obj._id,dn);
          // console.log("RECOMPUTE - my HABIT KEY: ",myhabitkey);
          var statdate = statDateFactory.makeStatDate(arrayofdates[dayNb]);
          console.log("statdate: ",statdate);

          getStatAndPopulateMap(obj._id,statdate,dayNb,i,allHabits.length);

        }
    }

        // console.log("!!! PERF MAP !!!! ",performanceMap);
        // var myLocalDateArray = calendarFactory.realDateArray;
        // var todaysmoment = moment().startOf('day');
        // var todaysDate = new Date(todaysmoment);
        // function checkDate(adate){
        //     var thedate = new Date(moment(adate).startOf('day'));
        //     console.log("NEXT WEEK - todaysDate: ",todaysDate.getDate()," - adate: ",thedate.getDate());
        //     return (thedate.getTime() == todaysDate.getTime());
        // }
        // var theindex = myLocalDateArray.findIndex(checkDate);

        // if(theindex != -1){
        //     calendarFactory.setIsWeekCurrent(true);
        // }
        //$scope.loggedIn = AuthFactory.isAuthenticated();
        //$scope.username = AuthFactory.getUsername();
    //mapFactory.mafunctionadoree();
    //$state.reload();
  },function(response){

  });
  };



  var getStatAndPopulateMap = function(habitid,statdate,dayNb,i,length){

    statisticFactory.getStatistic().query({habitid: habitid, statdate: statdate},
      function(response){
          if (response.value != undefined){
              mapFactory.pushPerfData(habitid, dayNb, response.value);
              console.log("AFTER QUERY - data pushed: ",response.value);
              console.log("i: ",i," - dn: ",dayNb);
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
                      console.log("AFTER SAVE - data pushed: ",response.value);
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



  //   console.log("FIRST COMPUTE - SCOPE.ALLHABITS: ",$scope.allhabits);

  //       for (var i = 0; i < $scope.allhabits.length; i++){
  //           var obj = $scope.allhabits[i];
  //           //$scope.toRecompute[obj._id] = false;
  //           for (var dn = 0; dn < 7; dn++){

  //               var myhabitid = obj._id;
  //               var myhabitdate = dn;
  //               var myhabitkey = mapFactory.makeKey(myhabitid,myhabitdate);
  //               var statdate = statDateFactory.makeStatDate($scope.realDateArray[dn]);
                
  //               statisticFactory.getStatistic().query({habitid: myhabitid, statdate: statdate},
  //                   function(response){
  //                       //console.log("GOT ANSWER! VALUE: ",response.value, " FOR HABITKEY ", myhabitkey)
  //                       //$scope.dayPerformed.set(myhabitkey, response.value);
  //                       if (response.value != undefined){
  //                           mapFactory.pushPerfData(myhabitid, dn, response.value);
  //                           console.log("data pushed: ",response.value);
  //                       }
  //                       if (response.value == undefined){
  //                           var newStatistic = {
  //                               date: statdate,
  //                               value: 0
  //                           };
  //                           statisticFactory.getStatistic().save({habitid: habitid, statdate: statdate}, newStatistic,
  //                               function(response){
  //                                   //console.log("--> SAVE_STATE_DURING_RECOMPUTING - value: ",response.value," - date: ",statdate);
  //                                   mapFactory.pushPerfData(habitid, dn, response.value);
  //                                   console.log("data pushed: ",response.value);
  //                                   //mapFactory.mafunctionadoree();
  //                                   $state.reload();
  //                               },
  //                               function(response){
  //                               }
  //                           );
  //                       }
  //                   },
  //                   function(response){
  //                       $scope.message = "Error: " + response.status + " " + response.statusText;
  //                   }
  //               );

  //           }
  //       }
  //       console.log("!!! PERF MAP !!!! ",mapFactory.perfmap);
  //       var myLocalDateArray = $scope.realDateArray;
  //       var todaysmoment = moment().startOf('day');
  //       var todaysDate = new Date(todaysmoment);
  //       function checkDate(adate){
  //           var thedate = new Date(moment(adate).startOf('day'));
  //           console.log("NEXT WEEK - todaysDate: ",todaysDate.getDate()," - adate: ",thedate.getDate());
  //           return (thedate.getTime() == todaysDate.getTime());
  //       }
  //       var theindex = myLocalDateArray.findIndex(checkDate);

  //       if(theindex != -1){
  //           calendarFactory.setIsWeekCurrent(true);
  //       }
  //       //$scope.loggedIn = AuthFactory.isAuthenticated();
  //       //$scope.username = AuthFactory.getUsername();
  //       mapFactory.mafunctionadoree();
  //       $state.reload();
  // }

  


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