'use strict';

angular.module('DashboardCtrl', [])

.controller('HeaderCtrl', ['$scope', '$state', '$rootScope', 'ngDialog', 'authFactory', function ($scope, $state, $rootScope, ngDialog, authFactory) {

    $scope.loggedIn = false;
    $scope.username = '';
    
    if(authFactory.isAuthenticated()) {
        console.log("isAuthenticated");
        $scope.loggedIn = true;
        $scope.username = authFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        console.log("openLogin");
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginCtrl" });
    };
    
    $scope.logOut = function() {
        console.log("logOut");
       authFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        console.log("login Successful");
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        console.log("registration Successful");
        $scope.loggedIn = authFactory.isAuthenticated();
        $scope.username = authFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        authFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterCtrl" });
    };

    //$scope.getCurrentUser = AuthFactory.getCurrentUser();        
    //console.log($scope.getCurrentUser);
    
}])

.controller('RegisterCtrl', ['$scope', 'ngDialog', '$localStorage', 'authFactory', function ($scope, ngDialog, $localStorage, authFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        authFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])

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
        
        return value = mapFactory.getPerfData(habitid, dayNb);
        //if(value == 0) return false;
        //if(value == 1) return true;
    };

    $scope.$on('recomputeDaysPerf', function () {
        
        //console.log("RECOMPUTE DAYS PERF");
        
        for (var i = 0; i < $scope.allhabits.length; i++){
                var obj = $scope.allhabits[i];
                //$scope.toRecompute[obj._id] = false;
                for (var dn = 0; dn < 7; dn++){

                    var myhabitid = obj._id;
                    var myhabitdate = dn;
                    var myhabitkey = mapFactory.makeKey(myhabitid,myhabitdate);
                    console.log("RECOMPUTE - KEY: ",myhabitkey);
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
        //$scope.loggedIn = AuthFactory.isAuthenticated();
        //$scope.username = AuthFactory.getUsername();
        mapFactory.mafunctionadoree();
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
        ngDialog.open({ template: 'views/addHabit.html', scope: $scope, className: 'ngdialog-theme-default', controller:"addHabitController" });
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
        switch(val)
        {
            case 0: return $scope.isToday[0];
            case 1: return $scope.isToday[1];
            case 2: return $scope.isToday[2];
            case 3: return $scope.isToday[3];
            case 4: return $scope.isToday[4];
            case 5: return $scope.isToday[5];
            case 6: return $scope.isToday[6];
        }
    };

    $scope.previousWeek = function()
    {
        console.log("previous week");
        calendarFactory.lastWeek();
        $state.reload();
    };
    $scope.nextWeek = function()
    {
        console.log("next week");
        calendarFactory.nextWeek();
    };
    $scope.todaysWeek = function()
    {
        console.log("today's week");
        calendarFactory.today();
    };

    
}])
;