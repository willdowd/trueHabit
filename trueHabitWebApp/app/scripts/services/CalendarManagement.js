'use strict';

angular.module('calendarManagement', [])

.factory('calendarFactory', ['moment', '$rootScope' ,
  function (moment, $rootScope) {

  var isTodayArr = [];
  var realDateArr = [];
  var displayDateArr = [];
  var weekIsCurrent = true;
  var currentViewDate = new Date();
  var dayOfTheWeek = -1;

  var calendarFac = {};
    // isTodayArr: isTodayArr,
    // realDateArray: realDateArr,
    // displayDateArr: displayDateArr,
    // dayOfTheWeek: dayOfTheWeek,
    // weekIsCurrent: weekIsCurrent
  //};

  calendarFac.getRealDateArray = function(){ return realDateArr; };
  calendarFac.getDisplayDateArr = function(){ return displayDateArr; };
  calendarFac.getIsTodayArr = function(){ return isTodayArr; };

  // switch(moment().day())
  // {
  //       case 0:
  //           dayOfTheWeek = 6;
  //           break;
  //       case 1:
  //           dayOfTheWeek = 0;
  //           break;
  //       case 2:
  //           dayOfTheWeek = 1;
  //           break;
  //       case 3:
  //           dayOfTheWeek = 2;
  //           break;
  //       case 4:
  //           dayOfTheWeek = 3;
  //           break;
  //       case 5:
  //           dayOfTheWeek = 4;
  //           break;
  //       case 6:
  //           dayOfTheWeek = 5;
  //           break;
  // };


  calendarFac.compileViewDates = function(){
    
    var currentViewMoment = moment(currentViewDate);
    var index = -1;
    var day = currentViewMoment.day();
    var date = currentViewMoment.date();
    switch(day){
        case 0:
            displayDateArr[6] = date;
            realDateArr[6]= currentViewDate;
            index = 6;
            isTodayArr[6] = true;
            break;
        case 1:
            displayDateArr[0] = date;
            realDateArr[0]= currentViewDate;
            index = 0;
            isTodayArr[0] = true;
            break;
        case 2:
            displayDateArr[1] = date;
            realDateArr[1] = currentViewDate;
            index = 1;
            isTodayArr[1] = true;
            break;
        case 3:
            displayDateArr[2] = date;
            realDateArr[2]= currentViewDate;
            index = 2;
            isTodayArr[2] = true;
            break;
        case 4:
            displayDateArr[3] = date;
            realDateArr[3]= currentViewDate;
            index = 3;
            isTodayArr[3] = true;
            break;
        case 5:
            displayDateArr[4] = date;
            realDateArr[4]= currentViewDate;
            index = 4;
            isTodayArr[4] = true;
            break;
        case 6:
            displayDateArr[5] = date;
            realDateArr[5]= currentViewDate;
            index = 5;
            isTodayArr[5] = true;
            break;
    }
    dayOfTheWeek = index;
    isTodayArr[index]=true;
    realDateArr[index]=currentViewDate;

    processDateArray(index, displayDateArr);
  };

  var processDateArray = function(index, arr){
    var h = -1;
    if(index != 0){
        for(var i=index-1;i>=0;i--)
        {
            h=index-i;
            var current = new Date(currentViewDate);
            //console.log("currentViewDate: ",currentViewDate," - index: ", index," - h: ",h);
            current.setDate(current.getDate()-h);
            //console.log("current: ", current);
            arr[i]=current.getDate();
            realDateArr[i]=current;
        }
    }
    if(index !=6){
        for(var i=index+1;i<=6;i++)
        {
            h=i-index;
            var current = new Date(currentViewDate);
            current.setDate(current.getDate()+h);
            //console.log("current: ", current);
            arr[i]=current.getDate();
            realDateArr[i]=current;
        }
    }
  };

  calendarFac.lastWeek = function(){
    var curr = currentViewDate;

    currentViewDate.setDate(currentViewDate.getDate()-7);

    console.log("BROADCAST - lastWeek method");
    $rootScope.$broadcast('recomputeDaysPerf');

  };

  calendarFac.nextWeek = function(){
    var curr = currentViewDate;

    currentViewDate.setDate(currentViewDate.getDate()+7);

    console.log("BROADCAST - nextWeek method");
    $rootScope.$broadcast('recomputeDaysPerf');
  };

  calendarFac.todaysWeek = function(){
    console.log("TODAYS WEEK BROADCAST - nextWeek method");
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