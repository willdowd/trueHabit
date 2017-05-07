'use strict';

angular.module('trueHabit')
.constant("baseURL", "https://localhost:3443/")

.factory('habitFactory', ['$resource', '$state', 'baseURL', function ($resource, $state, baseURL) {
  
  var habitFac = {};
  
  habitFac.habitResourceFromUserid = function() {
    return $resource(baseURL + "habits/:userid:habitid", {userid: "@userid", habitid:"@habitid"}, {
            'update': {
                method: 'PUT'
            }
        });
  };

  habitFac.deleteHabitFromUserId = function(userid, habitid) {
    var userid = userid;
    var habitid = habitid;
    $resource(baseURL + "habits/:userid/removehabit/:habitid", {userid: "@userid", habitid:"@habitid"})
    .delete({userid: userid, habitid: habitid},null,function(response){
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

  newHabitFac.addHabit = function(newHabit, userid) {

    habitFactory.habitResourceFromUserid().save(
      {userid: userid}, 
      newHabit, 
      function(response){
        $state.reload();
        // var habitid = response._id;
        // var statdate = moment().startOf('day').format("YYYY/MM/DD");
        // var mystring = statdate.toString();
        // console.log("MYSTRING: - ",mystring);

        // var newStatistic = {
        //     date: mystring,
        //     value: 0
        // };
        // statisticFactory.getStatistic().save({habitid: habitid}, newStatistic,
        //     function(response){
        //         console.log("response to add default stat: ",response);
        //         //return response.value;
        //     },
        //     function(response){
        //     }
        // );;
      },
      function(response){
      });
  };

  return newHabitFac;

}])


// .factory('habitStateFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

//   var habitStateFac = {

//   };

//   statFac.switchState = function(habitid, statdate, ){

//     statisticFactory.getStatistic().update({habitid: habitid, statdate: statdate}, newStatistic,
//       function(response){
//           console.log("--> SWITCH_STATE - value: ",response.value," - date: ",statdate);
          
//           //$scope.firsthabit[0] = response.value;
//           var specificKey = habitid.toString()+dayNb.toString();
//           //console.log("specificKey: ", specificKey);
//           $scope.performanceMap.set(specificKey,response.value);
//           //$rootScope.$broadcast('recomputeDaysPerf');
//           //$scope.recomputeDayPerformed = true;
//       },
//       function(response){
//       }
//     );

//   };

//   return habitStateFac;

// }])




.factory('mapFactory', ['$resource', 'baseURL', function ($resource, baseURL) {

  var performanceMap = [];

  var mapFac = {
    perfmap: performanceMap
  };

  mapFac.makeKey = function(habitid, dayNb){
    return habitid.toString()+dayNb.toString();
  };


  mapFac.pushPerfData = function(habitid, dayNb, perf){
    
    var mapkey = this.makeKey(habitid, dayNb);
    
    function findIndexVal(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    
    var index = performanceMap.findIndex(findIndexVal);
    console.log("index: ",index);
    
    if (index == -1){
      performanceMap.push({key: mapkey, value: perf});
    }
    performanceMap[index] = ({key: mapkey, value: perf});
  }


  mapFac.getPerfData = function(habitid, dayNb){
    
    var mapkey = this.makeKey(habitid, dayNb);
    
    function findval(item){
      return (item.key.localeCompare(mapkey)==0);
    }
    
    var foundItem = performanceMap.find(findval);
    
    if (foundItem == undefined){
      return 0;
    }
    return foundItem.value;
  }


  mapFac.mafunctionadoree = function(){
    performanceMap.forEach(myfunc);
    function myfunc(item, index){
      console.log("key: ",item.key," - value: ",item.value);
    }
  };

  return mapFac;

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



.factory('statisticFactory', ['$resource', 'baseURL', function ($resource, baseURL) {


  var statFac = {};

  statFac.getStatistic = function(){
    
    console.log("getStatistic in StatisticFactory");
    return $resource(baseURL + "habits/:habitid/statistic/:statdate", 
      null,//{habitid:"@habitid", statdate: "@statdate"},
      {'update': {method: 'PUT'},
      'query': {method:'GET', isArray:false}
    });
  };

  return statFac;

}])




.factory('calendarFactory', ['$resource', 'baseURL', 'moment', 
  function ($resource, baseURL, moment) {

  var isTodayArr = [];
  var realDateArr = [];
  var displayDateArr = [];

  var calendarFac = {
    isTodayArr: isTodayArr,
    realDateArr: realDateArr,
    displayDateArr: displayDateArr
  };

  calendarFac.compileViewDates = function(){
    console.log("COMPILE VIEW DATES");
    var now = moment();
    var index = -1;
    var day = now.day();
    var date = now.date();
    switch(day){
        case 0:
            displayDateArr[6] = date;
            realDateArr[6]= new Date();
            index = 6;
            isTodayArr[6] = true;
            break;
        case 1:
            displayDateArr[0] = date;
            realDateArr[0]= new Date();
            index = 0;
            isTodayArr[0] = true;
            break;
        case 2:
            displayDateArr[1] = date;
            realDateArr[1] = new Date();
            index = 1;
            isTodayArr[1] = true;
            break;
        case 3:
            displayDateArr[2] = date;
            realDateArr[2]= new Date();
            index = 2;
            isTodayArr[2] = true;
            break;
        case 4:
            displayDateArr[3] = date;
            realDateArr[3]= new Date();
            index = 3;
            isTodayArr[3] = true;
            break;
        case 5:
            displayDateArr[4] = date;
            realDateArr[4]= new Date();
            index = 4;
            isTodayArr[4] = true;
            break;
        case 6:
            displayDateArr[5] = date;
            realDateArr[5]= new Date();
            index = 5;
            isTodayArr[5] = true;
            break;
    }
    processDateArray(index, displayDateArr);
  };

  var processDateArray = function(index, arr){
    var h = -1;
    if(index != 0){
        for(var i=index-1;i>=0;i--)
        {
            h=index-i;
            var current = new Date();
            current.setDate(current.getDate()-h);
            arr[i]=current.getDate();
            realDateArr[i]=current;
        }
    }
    if(index !=6){
        for(var i=index+1;i<=6;i++)
        {
            h=i-index;
            var current = new Date();
            current.setDate(current.getDate()+h);
            arr[i]=current.getDate();
            realDateArr[i]=current;
        }
    }
  };

  return calendarFac;
}])


.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
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

.factory('AuthFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', function($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken;
    var userId;
    

  function loadUserCredentials() {
    console.log("loadUserCredentials");
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    console.log("storeUserCredentials");
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    console.log("useCredentials");
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
    $rootScope.$broadcast('recomputeDaysPerf');
  }
 
  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {
        
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
              $rootScope.$broadcast('recomputeDaysPerf');
           },
           function(response){
              isAuthenticated = false;
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>';
            
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

    };
    
    authFac.logout = function() {
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
              authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
              $rootScope.$broadcast('recomputeDaysPerf');
           },
           function(response){
            
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        return username;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])
;