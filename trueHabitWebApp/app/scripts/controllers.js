'use strict';

angular.module('trueHabit')

.controller('HeaderController', ['$scope', '$state', '$rootScope', 'ngDialog', 'AuthFactory', function ($scope, $state, $rootScope, ngDialog, AuthFactory) {

    $scope.loggedIn = false;
    $scope.username = '';


    
    if(AuthFactory.isAuthenticated()) {
        $scope.loggedIn = true;
        $scope.username = AuthFactory.getUsername();
    }
        
    $scope.openLogin = function () {
        ngDialog.open({ template: 'views/login.html', scope: $scope, className: 'ngdialog-theme-default', controller:"LoginController" });
    };
    
    $scope.logOut = function() {
       AuthFactory.logout();
        $scope.loggedIn = false;
        $scope.username = '';
    };
    
    $rootScope.$on('login:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
        
    $rootScope.$on('registration:Successful', function () {
        $scope.loggedIn = AuthFactory.isAuthenticated();
        $scope.username = AuthFactory.getUsername();
    });
    
    $scope.stateis = function(curstate) {
       return $state.is(curstate);  
    };
    
}])

.controller('LoginController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.loginData = $localStorage.getObject('userinfo','{}');
    
    $scope.doLogin = function() {
        if($scope.rememberMe)
           $localStorage.storeObject('userinfo',$scope.loginData);

        AuthFactory.login($scope.loginData);

        ngDialog.close();

    };
            
    $scope.openRegister = function () {
        ngDialog.open({ template: 'views/register.html', scope: $scope, className: 'ngdialog-theme-default', controller:"RegisterController" });
    };

    //$scope.getCurrentUser = AuthFactory.getCurrentUser();        
    //console.log($scope.getCurrentUser);
    
}])



.controller('AccountController', ['$scope', 'AuthFactory', function ($scope, AuthFactory) {
    $scope.username = '';
    
    if(AuthFactory.isAuthenticated()) {
        $scope.username = AuthFactory.getUsername();
    }
}])

.controller('RegisterController', ['$scope', 'ngDialog', '$localStorage', 'AuthFactory', function ($scope, ngDialog, $localStorage, AuthFactory) {
    
    $scope.register={};
    $scope.loginData={};
    
    $scope.doRegister = function() {
        console.log('Doing registration', $scope.registration);

        AuthFactory.register($scope.registration);
        
        ngDialog.close();

    };
}])





.controller('addHabitController', ['$scope', 'moment', 'ngDialog', 'newHabitFactory', 
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

// .controller('statisticController', ['$scope', 'ngDialog', '$state', '$localStorage', 'AuthFactory', 'habitFactory', function ($scope, ngDialog, $state, $localStorage, AuthFactory, habitFactory) {
    

// }])

.controller('HomeController', ['$scope', '$rootScope', 
    'moment', 'ngDialog', '$state', '$stateParams', 
    '$localStorage', 'AuthFactory', 'habitFactory', 
    'singleUsersFactory', 'multiUsersFactory', 'statisticFactory',
    'calendarFactory', 'mapFactory', //'habitStateFactory',
    'statDateFactory', 
    function ($scope, $rootScope, 
        moment, ngDialog, $state, $stateParams, 
        $localStorage, AuthFactory, habitFactory, 
        singleUsersFactory, multiUsersFactory, statisticFactory,
        calendarFactory, mapFactory, //habitStateFactory,
        statDateFactory) {
    
    
    $scope.viewDate = new Date();

    $scope.today = moment().startOf('day').format();
    $scope.username = AuthFactory.getUsername();
    $scope.message = "no message";
    $scope.user_id;


    calendarFactory.compileViewDates();
    $scope.realDateArray = calendarFactory.realDateArr;
    $scope.displayDateArray = calendarFactory.displayDateArr;
    $scope.isToday = calendarFactory.isTodayArr;


    $scope.firsthabit = [0, 0, 0, 0, 0, 0, 0];

    $scope.isdone = function(habitid, dayNb){
        var val = mapFactory.getPerfData(habitid, dayNb);
        console.log('isdone: ',val);
        var boolval = (val == 1);
        console.log('isdone bool: ',boolval);
        return boolval;
        //return (mapFactory.getPerfData(habitid, dayNb) == 1);
    }
    
    $scope.isDayPerf = function (habitid, dayNb) {
        
        return value = mapFactory.getPerfData(habitid, dayNb);
        //if(value == 0) return false;
        //if(value == 1) return true;
    };

    $rootScope.$on('recomputeDaysPerf', function () {
        
        console.log("RECOMPUTE DAYS PERF");
        
        for (var i = 0; i < $scope.allhabits.length; i++){
                var obj = $scope.allhabits[i];
                //$scope.toRecompute[obj._id] = false;
                for (var dn = 0; dn < 7; dn++){

                    var myhabitid = obj._id;
                    var myhabitdate = dn;
                    var myhabitkey = mapFac.makeKey(myhabitid,myhabitdate);

                    var statdate = statDateFactory.makeStatDate($scope.realDateArray[dn]);
                    
                    statisticFactory.getStatistic().query({habitid: myhabitid, statdate: statdate},
                        function(response){
                            //console.log("GOT ANSWER! VALUE: ",response.value, " FOR HABITKEY ", myhabitkey)
                            //$scope.dayPerformed.set(myhabitkey, response.value);
                            mapFac.pushPerfData(myhabitid, dn, response.value);
                        },
                        function(response){
                            $scope.message = "Error: " + response.status + " " + response.statusText;
                        }
                    );
                }
            }
        //$scope.loggedIn = AuthFactory.isAuthenticated();
        //$scope.username = AuthFactory.getUsername();
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

    
}])
;