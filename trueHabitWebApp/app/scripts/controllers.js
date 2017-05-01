'use strict';

angular.module('trueHabit')
;

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





.controller('addHabitController', ['$scope', 'ngDialog', '$state', '$localStorage', 'AuthFactory', 'habitFactory', 'statisticFactory', function ($scope, ngDialog, $state, $localStorage, AuthFactory, habitFactory, statisticFactory) {
    
    // var mydate = new Date();
    // var mydateyesterday = new Date();
    // mydateyesterday.setDate(mydateyesterday.getDate()-1);
    // var myval = 0;

    //var mystats = {myDate, 0};
    //var mystats2 = {}

    //var myarray = [ [mydate, 0], [mydateyesterday, 0]];
    //console.log("myarray: ",myarray);

    $scope.newHabit = {
        name: 'Floss',
        category: 'Health',
        daily: true
    };

    $scope.habitid;

    $scope.addNewHabit = function() {
        console.log('Add to habits', $scope.username, $scope.user_id);
        habitFactory.habitResourceFromUserid().save({userid: $scope.user_id}, $scope.newHabit, function(response)
            {
                $scope.newHabit = response;
                console.log("new habit created: ",response);
                $scope.habitid = $scope.newHabit._id;

                console.log('Add default statistic to new habit');
                var habitid = $scope.habitid;
                var statdate = new Date();

                $scope.newStatistic = {
                    date: statdate,
                    value: 0
                };
                statisticFactory.save({habitid: habitid}, $scope.newStatistic,
                    function(response){
                        console.log("response to add default stat: ",response);
                    },
                    function(response){
                    }
                );
                //addDefaultStatistic();
            },
            function(response){
            });
        //$scope.newHabit);
        $scope.newHabit = {
            name: '',
            category: '',
            daily: true,
            statistic: []
        };
        ngDialog.close();
        $state.reload();
    };

    // $scope.addDefaultStatistic = function() {
    //     console.log('Add default statistic to new habit');
    //     var habitid = $scope.habitid;
    //     var statdate = new Date();

    //     $scope.newStatistic = {
    //         date: statdate,
    //         value: 0
    //     };
    //     statisticFactory.post({habitid: habitid, statdate: statdate}, $scope.newStatistic,
    //         function(response){
    //             console.log("response to add default stat: ",response);
    //         },
    //         function(response){
    //         }
    //     );
    // }


}])

// .controller('statisticController', ['$scope', 'ngDialog', '$state', '$localStorage', 'AuthFactory', 'habitFactory', function ($scope, ngDialog, $state, $localStorage, AuthFactory, habitFactory) {
    
//     $scope.statistic

//     $scope.setNewStat = function() {
//         console.log('Add to habits', $scope.username, $scope.user_id);
//         habitFactory.habitResourceFromUserid().save({userid: $scope.user_id}, $scope.newHabit);
//         $scope.newHabit = {
//             name: '',
//             category: '',
//             daily: true,
//             positive: true
//         };
//         ngDialog.close();
//         $state.reload();
//     };

// }])

.controller('HomeController', ['$scope', 'ngDialog', '$state', '$stateParams', '$localStorage', 'AuthFactory', 'habitFactory', 'singleUsersFactory', 'multiUsersFactory',function ($scope, ngDialog, $state, $stateParams, $localStorage, AuthFactory, habitFactory, singleUsersFactory, multiUsersFactory) {
    
    $scope.date = new Date();
    $scope.username = AuthFactory.getUsername();
    $scope.message = "no message";
    $scope.user_id;
    $scope.realDateArray = [];
    $scope.dayArray = [0,0,0,0,0,0,0];
    $scope.viewDate = $scope.date;
    $scope.showId = false;

    $scope.isToday = [false, false, false, false, false, false, false];
    
    $scope.dayPerformed = [false, false, false, false, false, false, false];

    $scope.statPerHabitPerDay = [ {} ]

    $scope.dayArray = compileCurrentDate();
    
    $scope.isItToday = function(val)
    {
        switch(val)
        {
            case 0: return $scope.isToday[0]; break;
            case 1: return $scope.isToday[1]; break;
            case 2: return $scope.isToday[2]; break;
            case 3: return $scope.isToday[3]; break;
            case 4: return $scope.isToday[4]; break;
            case 5: return $scope.isToday[5]; break;
            case 6: return $scope.isToday[6]; break;
        }
    }

    $scope.isDayPerformed = function (habitid, dayNb) {
        //console.log("isDayPerformed - habitid",habitid);
        //console.log("isDayPerformed - dayNb",dayNb);
        return false;

        // switch(val)
        // {
        //     case 0: return $scope.dayPerformed[0]; break;
        //     case 1: return $scope.dayPerformed[1]; break;
        //     case 2: return $scope.dayPerformed[2]; break;
        //     case 3: return $scope.dayPerformed[3]; break;
        //     case 4: return $scope.dayPerformed[4]; break;
        //     case 5: return $scope.dayPerformed[5]; break;
        //     case 6: return $scope.dayPerformed[6]; break;
        // }
    };
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
            $scope.showId = true;
            //console.log("Let us try to log the habits of this user: ",response.habits);
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
            console.log("removeHabit has been called with habit: ",habitid," and user_id: ",$scope.user_id);
            //habitFactory.habitResourceFromUserid().delete({userid: $scope.user_id, habitid: habitid});
            habitFactory.deleteHabitFromUserId($scope.user_id, habitid);
            $state.reload();
        }, function () {
        });
    };
$scope.user_id;

    function compileCurrentDate() {
        var displayDateArray = [0,0,0,0,0,0,0];
        var index = -1;
        switch($scope.date.getDay()){
            case 0:
                displayDateArray[6] = $scope.date.getDate();
                $scope.realDateArray[6]= new Date();
                index = 6;
                $scope.isToday[6] = true;
                break;
            case 1:
                displayDateArray[0] = $scope.date.getDate();
                $scope.realDateArray[0]= new Date();
                index = 0;
                $scope.isToday[0] = true;
                break;
            case 2:
                displayDateArray[1] = $scope.date.getDate();
                $scope.realDateArray[1]= new Date();
                index = 1;
                $scope.isToday[1] = true;
                break;
            case 3:
                displayDateArray[2] = $scope.date.getDate();
                $scope.realDateArray[2]= new Date();
                index = 2;
                $scope.isToday[2] = true;
                break;
            case 4:
                displayDateArray[3] = $scope.date.getDate();
                $scope.realDateArray[3]= new Date();
                index = 3;
                $scope.isToday[3] = true;
                break;
            case 5:
                displayDateArray[4] = $scope.date.getDate();
                $scope.realDateArray[4]= new Date();
                index = 4;
                $scope.isToday[4] = true;
                break;
            case 6:
                displayDateArray[5] = $scope.date.getDate();
                $scope.realDateArray[5]= new Date();
                index = 5;
                $scope.isToday[5] = true;
                break;
        }
        //console.log("displayDateArray before the processing: ",displayDateArray);
        var theArray = processDateArray(index, displayDateArray);
        //console.log("displayDateArray after the processing: ",theArray);
        //console.log("display REAL DateArray after the processing: ",$scope.realDateArray);
        return theArray;
    };

    function processDateArray(ind, arr) {
        var currDate = new Date();
        //console.log("currDate: ",currDate);
        var currminusDate = new Date();
        currminusDate.setDate(currminusDate.getDate() - 1);
        //console.log("currminusDate: ",currminusDate);
        
        var h = -1;
        if(ind != 0){
            for(var i=ind-1;i>=0;i--)
            {
                h=ind-i;
                //console.log("i: ",i," h: ",h);
                var current = new Date();
                current.setDate(current.getDate()-h);
                arr[i]=current.getDate();
                $scope.realDateArray[i]=current;
            }
        }
        if(ind !=6){
            for(var i=ind+1;i<=6;i++)
            {
                h=i-ind;
                //console.log("2eme phase: h: ",h," i: ",i);
                var current = new Date();
                current.setDate(current.getDate()+h);
                arr[i]=current.getDate();
                $scope.realDateArray[i]=current;
            }
        }
         return arr;
    }


    $scope.switchState = function(habitid, dayNb){
        // var statdate = new Date();
        // var statvalue = 0;
        // var statval = 0;
        
        // console.log("try to get the habit stat with habitResourceForGetStat");
        // var habitstats = habitFactory.habitResourceForGetStat().get({habitid: habitid},
        //     function(response){
        //         console.log("successfully called habitReousrceForGetStat, response is: ",response);
        //         if (response != undefined){
        //             console.log("response: ",response);
        //             statvalue = response[statdate];
        //         }
        //         console.log("after habitResourceForGetStat - statvalue: ",statvalue);

        //         if (statvalue == 0){ 
        //             statval=1;
        //         }

        //         console.log('put stat in habit with date', statdate);
        //         console.log('put stat in habit with val ', statval);
        //         console.log('put stat in habit with habitid: ',habitid);
        //         habitFactory.habitResourceForPutStat().update({habitid: habitid,statdate: statdate, statval: statval},
        //             function(response){
        //                 statvalue = response;
        //                 console.log("stat value after the put: ",statvalue);
        //             },
        //             function(response){

        //             }
        //         );
        //     },
        //     function(response){

        //     }
        // );

        

        //$state.reload();
    }

    
}])
;