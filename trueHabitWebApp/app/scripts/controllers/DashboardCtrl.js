'use strict';

angular.module('DashboardCtrl', [])



.controller('AddHabitCtrl', ['$scope', 'moment', 'ngDialog', 'newHabitFactory',
    'authFactory', 
    function ($scope, moment, ngDialog, newHabitFactory,
        authFactory) {
    
    var vm = $scope;
    vm.newHabit = {
        name: 'Floss',
        category: 'Health',
        daily: true,
        statistic: []
    };

    $scope.addNewHabit = function() {
        newHabitFactory.addHabit(vm.newHabit);
        ngDialog.close();
    };
}])

.controller('DashboardCtrl', ['$scope', '$rootScope', 
    'moment', 'ngDialog', '$state', '$stateParams', 
    '$localStorage', 'authFactory', 'habitFactory', 
    'singleUsersFactory', 'multiUsersFactory', 'statisticFactory',
    'calendarFactory', 'mapFactory', 'weeklyScoreFactory',
    'statDateFactory', 'recomputeFactory',
    function ($scope, $rootScope, 
        moment, ngDialog, $state, $stateParams, 
        $localStorage, authFactory, habitFactory, 
        singleUsersFactory, multiUsersFactory, statisticFactory,
        calendarFactory, mapFactory,weeklyScoreFactory,
        statDateFactory,recomputeFactory) {

    
    singleUsersFactory.query({username: authFactory.getUsername()},
        function(response){
            $scope.allHabits = response.habits;
            $scope.weeklyScore = weeklyScoreFactory.computeWeeklyScore($scope.allHabits);
        },
        function(response){
          //exception management
        });
    calendarFactory.compileViewDates();
    var realDateArray = calendarFactory.getRealDateArray();
    var isToday = calendarFactory.getIsTodayArr();

    $scope.isButtonDisabled = function(dayNb)
    {
        return (calendarFactory.isWeekCurrent() && (dayNb > calendarFactory.getTodayDayNb()));
    }

    if (mapFactory.getMapSize() == 0)
    {
        console.log("MAP SIZE == 0 --> RECOMPUTE");
        recomputeFactory.generalRecompute();
    }

    // $scope variables because used in child scope AddNewHabitCtrl - not used in Dashboard view.
    //$scope.user_id = authFactory.getUserId();
    //$scope.username = authFactory.getUsername();

    $scope.displayDateArray = calendarFactory.getDisplayDateArr();

    //console.log("real date array: ",realDateArray);

    $scope.isdone = function(habitid, dayNb){
        return ((mapFactory.getPerfData(habitid, dayNb) == 1) );//&& (!isButtonDisabled(dayNb)) );
    }
    
    $scope.isDayPerf = function (habitid, dayNb) {
        // if(dayNb == 6){
        //     mapFactory.mafunctionadoree();
        // }
        return value = mapFactory.getPerfData(habitid, dayNb);
        //if(value == 0) return false;
        //if(value == 1) return true;
    };

    $scope.openAddHabit = function () {
        ngDialog.open({ 
            template: 'views/addHabit.html', 
            scope: $scope, 
            className: 'ngdialog-theme-default', 
            controller:"AddHabitCtrl" 
        });
    };

    $scope.removeHabit = function (habitid) {
        ngDialog.openConfirm({
            template: 'views/removeHabitModal.html',
            className: 'ngdialog-theme-default'
        }).then(function () {
            habitFactory.deleteHabit(habitid);
        }, function () {
        });
    };

    $scope.resetHabit = function (habitid) {
        ngDialog.openConfirm({
            template: 'views/resetHabitModal.html',
            className: 'ngdialog-theme-default'
        }).then(function () {
            statisticFactory.resetStatistics(habitid);
        }, function () {
        });
    };

    $scope.viewStatistics = function (habitid) {
        ngDialog.open({
            template: '<h4>View Statistics</h4><p>Feature coming soon</p>',
            plain: true
        });
    };

    $scope.switchState = function(habitid, dayNb){


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
                mapFactory.mafunctionadoree();
                $state.reload();
            },
            function(response){
            }
        );
    };

    $scope.isItToday = function(val)
    {
        if(calendarFactory.isWeekCurrent())
        {
            return isToday[val];
        }
    };

    $scope.previousWeek = function()
    {
        calendarFactory.lastWeek();
        calendarFactory.setIsWeekCurrent(false);
        $state.reload();
    };
    $scope.nextWeek = function()
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
    
    $scope.todaysWeek = function()
    {
        calendarFactory.setIsWeekCurrent(true);
        calendarFactory.todaysWeek();
        console.log("CALENDAR FACTORY - SET WEEK IS CURRENT - TRUE");
        console.log("today's week");
    };

    $scope.$on('recomputeDaysPerf', function () {
        console.log("!BROADCAST DETECTED!")
        recomputeFactory.generalRecompute();
    });
    


}])

;





