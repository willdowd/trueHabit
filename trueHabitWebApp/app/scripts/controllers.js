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

    $scope.getCurrentUser = AuthFactory.getCurrentUser();        
    console.log($scope.getCurrentUser);
    
}])

.controller('HomeController', ['$scope', 'ngDialog', '$state', '$stateParams', '$localStorage', 'AuthFactory', 'habitFactory', 'singleUsersFactory', 'multiUsersFactory',function ($scope, ngDialog, $state, $stateParams, $localStorage, AuthFactory, habitFactory, singleUsersFactory, multiUsersFactory) {
    
    $scope.date = new Date();
    $scope.username = AuthFactory.getUsername();
    $scope.message = "no message";
    $scope.user_id;
    //$scope.currentHabit_id;
    $scope.showId = false;

    // $scope.allhabits = habitFactory.query({username: $scope.username},
    //     function (response) {
    //     },
    //     function (response) {
    //         $scope.message = "Error: " + response.status + " " + response.statusText;
    //     }
    // );

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
            console.log("Let us try to log the habits of this user: ",response.habits);
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
                    habitFactory.habitResourceFromHabitid().delete({habitid: habitid});
                    $state.reload();
                }, function () {
                });
            };
    
}])

.controller('addHabitController', ['$scope', 'ngDialog', '$state', '$localStorage', 'AuthFactory', 'habitFactory', function ($scope, ngDialog, $state, $localStorage, AuthFactory, habitFactory) {
    
    $scope.newHabit = {
        name: 'Floss',
        category: 'Health',
        daily: true,
        positive: true,
    };

    $scope.addNewHabit = function() {
        console.log('Add to habits', $scope.username, $scope.user_id);
        habitFactory.habitResourceFromUserid().save({userid: $scope.user_id}, $scope.newHabit);
        $scope.newHabit = {
            name: '',
            category: '',
            daily: true,
            positive: true
        };
        ngDialog.close();
        $state.reload();
    };

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
;