'use strict';

angular.module('DashboardCtrl', [])



.controller('AddHabitCtrl', ['$scope', 'moment', 'ngDialog', 'newHabitFactory', 
    function ($scope, moment, ngDialog, newHabitFactory) {
    
    var vm = $scope;
    vm.newHabit = {
        name: 'Floss',
        category: 'Health',
        daily: true,
        statistic: []
    };

    $scope.addNewHabit = function() {
        console.log('Add to habits', vm.username, vm.user_id);
        newHabitFactory.addHabit(vm.newHabit, vm.user_id);
        ngDialog.close();
    };
}])

.controller('DashboardCtrl', ['$scope', '$rootScope', 
    'moment', 'ngDialog', '$state', '$stateParams', 
    '$localStorage', 'authFactory', 'habitFactory', 
    'singleUsersFactory', 'multiUsersFactory', 'statisticFactory',
    'calendarFactory', 'mapFactory',
    'statDateFactory', 
    function ($scope, $rootScope, 
        moment, ngDialog, $state, $stateParams, 
        $localStorage, authFactory, habitFactory, 
        singleUsersFactory, multiUsersFactory, statisticFactory,
        calendarFactory, mapFactory,
        statDateFactory) {
    
    
    $scope.todayAsDate = new Date();
    $scope.dayOfTheWeek;

    //$scope.today = moment().startOf('day').format();
    $scope.username = authFactory.getUsername();
    $scope.message = "no message";
    $scope.user_id;


    calendarFactory.compileViewDates();

    $scope.realDateArray = calendarFactory.realDateArr;
    $scope.displayDateArray = calendarFactory.displayDateArr;
    $scope.isToday = calendarFactory.isTodayArr;
    $scope.titleViewDate = calendarFactory.titleViewDate;

    $scope.dayOfTheWeek = calendarFactory.dayOfTheWeek;

    console.log("dayOfTheWeek: ",$scope.dayOfTheWeek);

    console.log("titleViewDate: ",$scope.titleViewDate);

    console.log("real date array: ",$scope.realDateArray);

    




    $scope.isdone = function(habitid, dayNb){
        return (mapFactory.getPerfData(habitid, dayNb) == 1);
    }
    
    $scope.isDayPerf = function (habitid, dayNb) {
        // if(dayNb == 6){
        //     mapFactory.mafunctionadoree();
        // }
        return value = mapFactory.getPerfData(habitid, dayNb);
        //if(value == 0) return false;
        //if(value == 1) return true;
    };

    //$scope.$on('firstCompute', function() {
        // console.log("FIRST COMPUTE - SCOPE.ALLHABITS: ",$scope.allhabits);
        // for (var i = 0; i < $scope.allhabits.length; i++){
        //     var obj = $scope.allhabits[i];
        //     //$scope.toRecompute[obj._id] = false;
        //     for (var dn = 0; dn < 7; dn++){

        //         var myhabitid = obj._id;
        //         var myhabitdate = dn;
        //         var myhabitkey = mapFactory.makeKey(myhabitid,myhabitdate);
        //         var statdate = statDateFactory.makeStatDate($scope.realDateArray[dn]);
                
        //         statisticFactory.getStatistic().query({habitid: myhabitid, statdate: statdate},
        //             function(response){
        //                 //console.log("GOT ANSWER! VALUE: ",response.value, " FOR HABITKEY ", myhabitkey)
        //                 //$scope.dayPerformed.set(myhabitkey, response.value);
        //                 if (response.value != undefined){
        //                     mapFactory.pushPerfData(myhabitid, dn, response.value);
        //                     console.log("data pushed: ",response.value);
        //                 }
        //                 if (response.value == undefined){
        //                     var newStatistic = {
        //                         date: statdate,
        //                         value: 0
        //                     };
        //                     statisticFactory.getStatistic().save({habitid: habitid, statdate: statdate}, newStatistic,
        //                         function(response){
        //                             //console.log("--> SAVE_STATE_DURING_RECOMPUTING - value: ",response.value," - date: ",statdate);
        //                             mapFactory.pushPerfData(habitid, dn, response.value);
        //                             console.log("data pushed: ",response.value);
        //                             //mapFactory.mafunctionadoree();
        //                             $state.reload();
        //                         },
        //                         function(response){
        //                         }
        //                     );
        //                 }
        //             },
        //             function(response){
        //                 $scope.message = "Error: " + response.status + " " + response.statusText;
        //             }
        //         );

        //     }
        // }
        // console.log("!!! PERF MAP !!!! ",mapFactory.perfmap);
    //}

    $scope.$on('recomputeDaysPerf', function () {
        
        //console.log("RECOMPUTE DAYS PERF");
        console.log("FIRST COMPUTE - SCOPE.ALLHABITS: ",$scope.allhabits);
        for (var i = 0; i < $scope.allhabits.length; i++){
            var obj = $scope.allhabits[i];
            //$scope.toRecompute[obj._id] = false;
            for (var dn = 0; dn < 7; dn++){

                var myhabitid = obj._id;
                var myhabitdate = dn;
                var myhabitkey = mapFactory.makeKey(myhabitid,myhabitdate);
                var statdate = statDateFactory.makeStatDate($scope.realDateArray[dn]);
                
                statisticFactory.getStatistic().query({habitid: myhabitid, statdate: statdate},
                    function(response){
                        //console.log("GOT ANSWER! VALUE: ",response.value, " FOR HABITKEY ", myhabitkey)
                        //$scope.dayPerformed.set(myhabitkey, response.value);
                        if (response.value != undefined){
                            mapFactory.pushPerfData(myhabitid, dn, response.value);
                            console.log("data pushed: ",response.value);
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
                                    console.log("data pushed: ",response.value);
                                    //mapFactory.mafunctionadoree();
                                    $state.reload();
                                },
                                function(response){
                                }
                            );
                        }
                    },
                    function(response){
                        $scope.message = "Error: " + response.status + " " + response.statusText;
                    }
                );

            }
        }
        console.log("!!! PERF MAP !!!! ",mapFactory.perfmap);
        var myLocalDateArray = $scope.realDateArray;
        var todaysmoment = moment().startOf('day');
        var todaysDate = new Date(todaysmoment);
        function checkDate(adate){
            var thedate = new Date(moment(adate).startOf('day'));
            console.log("NEXT WEEK - todaysDate: ",todaysDate.getDate()," - adate: ",thedate.getDate());
            return (thedate.getTime() == todaysDate.getTime());
        }
        var theindex = myLocalDateArray.findIndex(checkDate);

        if(theindex != -1){
            calendarFactory.setIsWeekCurrent(true);
        }
        //$scope.loggedIn = AuthFactory.isAuthenticated();
        //$scope.username = AuthFactory.getUsername();
        mapFactory.mafunctionadoree();
        $state.reload();
    });

    $scope.allusers = multiUsersFactory.query(
        function(response){

        },
        function(response){
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    singleUsersFactory.query({username: $scope.username},
        function(response){
            $scope.user_id = response._id;
            $scope.allhabits = response.habits;
        },
        function(response){
            $scope.message = "Error: " + response.status + " " + response.statusText;
        }
    );

    $scope.openAddHabit = function () {
        ngDialog.open({ template: 'views/addHabit.html', scope: $scope, className: 'ngdialog-theme-default', controller:"AddHabitCtrl" });
    };

    $scope.removeHabit = function (habitid) {
        ngDialog.openConfirm({
            template: 'views/removeHabitModal.html',
            className: 'ngdialog-theme-default'
        }).then(function () {
            habitFactory.deleteHabitFromUserId($scope.user_id, habitid);
        }, function () {
        });
    };


    $scope.switchState = function(habitid, dayNb){


        var statdate = statDateFactory.makeStatDate($scope.realDateArray[dayNb]);
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
            return $scope.isToday[val];
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
        var myLocalDateArray = $scope.realDateArray;
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

    
}])
;