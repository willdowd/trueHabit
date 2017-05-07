'use strict';

angular.module('calendarManagement', [])

.factory('calendarFactory', ['moment', 
  function (moment) {

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
;