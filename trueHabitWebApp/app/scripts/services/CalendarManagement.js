'use strict';

angular.module('calendarManagement', [])

.factory('calendarFactory', ['moment','$rootScope',
  function (moment, $rootScope) {

  var isTodayArr = [false,false,false,false,false,false,false];
  var realDateArr = [];
  var displayDateArr = [];
  var weekIsCurrent = true;
  var currentViewDate = new Date();
  var todayDayNb = -1;

  var calendarFac = {};


  calendarFac.getRealDateArray = function(){ return realDateArr; };
  calendarFac.getDisplayDateArr = function(){ return displayDateArr; };
  calendarFac.getIsTodayArr = function(){ return isTodayArr; };
  calendarFac.getTodayDayNb = function(){ return todayDayNb; };

  calendarFac.compileAlwaysThisWeek = function(){
    var thisWeekTodayArr = [];
    var thisWeekRealDateArr = [];
    var thisWeekDisplayDateArr = [];
    calendarFac.compileDates(new Date(), thisWeekTodayArr,thisWeekRealDateArr,thisWeekDisplayDateArr);
    return thisWeekRealDateArr;
  }

  
  calendarFac.compileViewDates = function(){
    
    var currentViewMoment = moment(currentViewDate);
    if ((currentViewMoment.format("YYYYMMDD")).localeCompare(moment().format("YYYYMMDD")) == 0){
      calendarFac.setIsWeekCurrent(true);
    }
    calendarFac.compileDates(currentViewDate, isTodayArr, realDateArr, displayDateArr);

  };


  calendarFac.compileDates = function(goalDate, myIsTodayArr, myrealDateArr,mydisplayDateArr){
    
    var currentViewMoment = moment(goalDate);
    var day = currentViewMoment.day();
    var date = currentViewMoment.date();

    switch(day){
        case 0:
            // mydisplayDateArr[6] = date;
            // realDateArr[6]= goalDate;
            todayDayNb = 6;
            // isTodayArr[6] = true;
            break;
        case 1:
            // mydisplayDateArr[0] = date;
            // realDateArr[0]= goalDate;
            todayDayNb = 0;
            // isTodayArr[0] = true;
            break;
        case 2:
            // mydisplayDateArr[1] = date;
            // realDateArr[1] = goalDate;
            todayDayNb = 1;
            // isTodayArr[1] = true;
            break;
        case 3:
            // mydisplayDateArr[2] = date;
            // realDateArr[2]= goalDate;
            todayDayNb = 2;
            // isTodayArr[2] = true;
            break;
        case 4:
            // mydisplayDateArr[3] = date;
            // realDateArr[3]= goalDate;
            todayDayNb = 3;
            // isTodayArr[3] = true;
            break;
        case 5:
            // mydisplayDateArr[4] = date;
            // realDateArr[4]= goalDate;
            todayDayNb = 4;
            // isTodayArr[4] = true;
            break;
        case 6:
            // mydisplayDateArr[5] = date;
            // realDateArr[5]= goalDate;
            todayDayNb = 5;
            // isTodayArr[5] = true;
            break;
    }

    myIsTodayArr[todayDayNb]=true;
    myrealDateArr[todayDayNb]=goalDate;
    mydisplayDateArr[todayDayNb]=date;

    processDateArray(todayDayNb, mydisplayDateArr, myrealDateArr,goalDate);
  }

  

  var processDateArray = function(index,arr,myrealDateArr,goalDate){
    var h = -1;
    if(index != 0){
        for(var i=index-1;i>=0;i--)
        {
            h=index-i;
            var current = new Date(goalDate);
            current.setDate(current.getDate()-h);
            arr[i]=current.getDate();
            myrealDateArr[i]=current;
        }
    }
    if(index !=6){
        for(var i=index+1;i<=6;i++)
        {
            h=i-index;
            var current = new Date(goalDate);
            current.setDate(current.getDate()+h);
            arr[i]=current.getDate();
            myrealDateArr[i]=current;
        }
    }
  };

  calendarFac.lastWeek = function(){
    currentViewDate.setDate(currentViewDate.getDate()-7);
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  calendarFac.nextWeek = function(){
    currentViewDate.setDate(currentViewDate.getDate()+7);
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  calendarFac.todaysWeek = function(){
    currentViewDate = new Date();
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  calendarFac.isWeekCurrent = function(){
    return weekIsCurrent;
  };

  calendarFac.setIsWeekCurrent = function(mybool){
    weekIsCurrent = mybool;
    console.log("setIsWeekCurrent - weekIsCurrent: ",weekIsCurrent);
  };


  return calendarFac;
}])
;