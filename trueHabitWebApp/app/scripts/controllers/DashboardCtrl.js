'use strict';

angular.module('DashboardCtrl', [])


.controller('AddHabitCtrl', ['$scope', 'moment', 'ngDialog', 'habitFactory',
    'authFactory', 
    function ($scope, moment, ngDialog, habitFactory,
        authFactory) {
    
    var vm = $scope;
    vm.newHabit = {
        name: 'Floss',
        category: 'Health',
        daily: true,
        statistic: []
    };

    $scope.addNewHabit = function() {
        habitFactory.addHabit(vm.newHabit);
        ngDialog.close();
    };
}])

.controller('DashboardCtrl', ['$scope', '$rootScope', 'moment', 'ngDialog', '$state', 
    'authFactory', 'habitFactory', 'singleUsersFactory', 'statisticFactory',
    'calendarFactory', 'mapFactory', 'weeklyScoreFactory',
    'statDateFactory', 'recomputeFactory',
    function ($scope, $rootScope, moment, ngDialog, $state, 
        authFactory, habitFactory, singleUsersFactory, statisticFactory,
        calendarFactory, mapFactory,weeklyScoreFactory,
        statDateFactory,recomputeFactory) {

    
    calendarFactory.compileViewDates();
    retrieveAllHabits();
    var realDateArray = calendarFactory.getRealDateArray();
    var isToday = calendarFactory.getIsTodayArr();

    $scope.isButtonDisabled     = isButtonDisabled;
    $scope.isdone               = isdone;
    $scope.getCurrentStreak     = getCurrentStreak;
    $scope.openAddHabit         = openAddHabit;
    $scope.isDayPerf            = isDayPerf;
    $scope.removeHabit          = removeHabit;
    $scope.resetHabit           = resetHabit;
    $scope.viewStatistics       = viewStatistics;
    $scope.switchState          = switchState;
    $scope.isItToday            = isItToday;
    $scope.previousWeek         = previousWeek; 
    $scope.nextWeek             = nextWeek;
    $scope.todaysWeek           = todaysWeek;
    $scope.viewDate             = calendarFactory.getCurrentViewDate();

    console.log("!!! VIEW DATE!!! ",$scope.viewDate);

    $scope.displayDateArray = calendarFactory.getDisplayDateArr();

    $scope.$on('recomputeDaysPerf', function () {
        console.log("!BROADCAST DETECTED!")
        recomputeFactory.generalRecompute();
    });

    function retrieveAllHabits()
    {
        singleUsersFactory.query({username: authFactory.getUsername()},
        function(response){
            $scope.allHabits = response.habits;
            $scope.weeklyScore = weeklyScoreFactory.computeWeeklyScore(response.habits);
        },
        function(response){
          //exception management
        });
    }

    function isButtonDisabled(dayNb)
    {
        return (calendarFactory.isWeekCurrent() && (dayNb > calendarFactory.getTodayDayNb()));
    }

    if (mapFactory.getMapSize() == 0)
    {
        console.log("MAP SIZE == 0 --> RECOMPUTE");
        recomputeFactory.generalRecompute();
    }

    function isdone(habitid, dayNb){
        return ((mapFactory.getPerfData(habitid, dayNb) == 1) );
    }
    function getCurrentStreak(habitid) {
        return mapFactory.getCurrentStreakData(habitid);
    }

    function isDayPerf(habitid, dayNb) {
        return mapFactory.getPerfData(habitid, dayNb);
    };
    
    function openAddHabit(){
        if($scope.allHabits != undefined){
            var nbHabits = $scope.allHabits.length;
            if (nbHabits<5){
                ngDialog.open({ 
                    template: 'views/addHabit.html', 
                    scope: $scope, 
                    className: 'ngdialog-theme-default', 
                    controller:"AddHabitCtrl" 
                });
            }
            else if (nbHabits>=5){
                ngDialog.open({
                    template: 'views/maxHabitModal.html',
                    className: 'ngdialog-theme-default'
                });
            }
        }
    };

    function removeHabit(habitid) {
        ngDialog.openConfirm({
            template: 'views/removeHabitModal.html',
            className: 'ngdialog-theme-default'
        }).then(function () {
            habitFactory.deleteHabit(habitid);
        }, function () {
        });
    };

    function resetHabit(habitid) {
        ngDialog.openConfirm({
            template: 'views/resetHabitModal.html',
            className: 'ngdialog-theme-default'
        }).then(function () {
            statisticFactory.resetStatistics(habitid);
        }, function () {
        });
    };


    function viewStatistics(habitid) {
        ngDialog.open({
            template: '<h4>View Statistics</h4><p>Feature coming soon</p>',
            plain: true
        });
    };


    function switchState(habitid, dayNb){
        var statdate = statDateFactory.makeStatDate(realDateArray[dayNb]);
        console.log("SWITCH_STATE: statdate from statDateFactory: ",statdate);

        var currValue = mapFactory.getPerfData(habitid, dayNb);
        if (currValue == 0 || currValue == undefined){
            newValue = 1;
        }
        if (currValue == 1){
            newValue = 0;
        }
        var newStatistic = {
            date: statdate,
            value: newValue
        };
        statisticFactory.getStatistic().update({habitid: habitid, statdate: statdate}, newStatistic,
            function(response){
                console.log("--> SWITCH_STATE - value: ",response.value," - date: ",statdate);
                mapFactory.pushPerfData(habitid, dayNb, response.value);
                recomputeFactory.generalRecompute();
                $state.reload();
            },
            function(response){
            }
        );
    };


    function isItToday(val)
    {
        if(calendarFactory.isWeekCurrent())
        {
            return isToday[val];
        }
    };

    function previousWeek()
    {
        $scope.lastWeekWarning = (calendarFactory.lastWeek() == false);
    };

    function nextWeek()
    {
        var myLocalDateArray = realDateArray;
        var todaysmoment = moment().startOf('day');
        var todaysDate = new Date(todaysmoment);
        function checkDate(adate){
            var thedate = new Date(moment(adate).startOf('day'));
            return (thedate.getTime() == todaysDate.getTime());
        }
        var theindex = myLocalDateArray.findIndex(checkDate);

        if(theindex == -1){
            calendarFactory.nextWeek();
        }
        else
        {
            calendarFactory.setIsWeekCurrent(true);
        }
    };
    
    function todaysWeek()
    {
        calendarFactory.setIsWeekCurrent(true);
        calendarFactory.todaysWeek();
        console.log("CALENDAR FACTORY - SET WEEK IS CURRENT - TRUE");
        console.log("today's week");
    };

}])

;





