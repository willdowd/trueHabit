'use strict';

angular.module('calendarManagement', [])

.factory('calendarFactory', ['moment','$rootScope',
  function (moment, $rootScope) {

  var processDateArray = processDateArray;

  var isTodayArr = [false,false,false,false,false,false,false];
  var realDateArr = [];
  var displayDateArr = [];
  var weekIsCurrent = true;
  var currentViewDate = new Date();
  var todayDayNb = -1;

  var calendarFac = {
    getCurrentViewDate: getCurrentViewDate,
    getRealDateArray: getRealDateArray,
    getDisplayDateArr: getDisplayDateArr,
    getIsTodayArr: getIsTodayArr,
    getTodayDayNb: getTodayDayNb,
    compileAlwaysThisWeek: compileAlwaysThisWeek,
    compileViewDates: compileViewDates,
    compileDates: compileDates,
    lastWeek: lastWeek,
    nextWeek: nextWeek,
    todaysWeek: todaysWeek,
    isWeekCurrent: isWeekCurrent,
    setIsWeekCurrent: setIsWeekCurrent
  };

  return calendarFac;


  function getRealDateArray(){ return realDateArr; };
  function getDisplayDateArr(){ return displayDateArr; };
  function getIsTodayArr(){ return isTodayArr; };
  function getTodayDayNb(){ return todayDayNb; };
  function getCurrentViewDate(){ return currentViewDate; };

  function compileAlwaysThisWeek(){
    var thisWeekTodayArr = [];
    var thisWeekRealDateArr = [];
    var thisWeekDisplayDateArr = [];
    calendarFac.compileDates(new Date(), thisWeekTodayArr,thisWeekRealDateArr,thisWeekDisplayDateArr);
    return thisWeekRealDateArr;
  }
  
  function compileViewDates(){
    var currentViewMoment = moment(currentViewDate);
    if ((currentViewMoment.format("YYYYMMDD")).localeCompare(moment().format("YYYYMMDD")) == 0){
      calendarFac.setIsWeekCurrent(true);
    }
    calendarFac.compileDates(currentViewDate, isTodayArr, realDateArr, displayDateArr);
  };


  function compileDates(goalDate, myIsTodayArr, myrealDateArr,mydisplayDateArr){
    
    var currentViewMoment = moment(goalDate);
    var day = currentViewMoment.day();
    var date = currentViewMoment.date();
    if(day == 0){
      todayDayNb = 6;
    } else {
      todayDayNb = day-1;
    }

    myIsTodayArr[todayDayNb]=true;
    myrealDateArr[todayDayNb]=goalDate;
    mydisplayDateArr[todayDayNb]=date;

    processDateArray(todayDayNb, mydisplayDateArr, myrealDateArr,goalDate);
  }

  

  function processDateArray(index,arr,myrealDateArr,goalDate){
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


  function lastWeek(){
    var newViewDate = currentViewDate;
    newViewDate.setDate(currentViewDate.getDate()-7);
    if(!(newViewDate.getFullYear()==2017 && newViewDate.getMonth()==2))
    {
      console.log("IT'S OK IT'S NOT MARCH yet we can go back in time");
      currentViewDate = newViewDate;
      calendarFac.setIsWeekCurrent(false);
      $rootScope.$broadcast('recomputeDaysPerf');
      console.log("RETURN TRUE");
      return true;
    }
    return false;
  };

  function nextWeek(){
    currentViewDate.setDate(currentViewDate.getDate()+7);
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  function todaysWeek(){
    currentViewDate = new Date();
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  function isWeekCurrent(){
    return weekIsCurrent;
  };

  function setIsWeekCurrent(mybool){
    weekIsCurrent = mybool;
    console.log("setIsWeekCurrent - weekIsCurrent: ",weekIsCurrent);
  };


}])
;