'use strict';

angular.module('trueHabit', [
    'ui.router',
    'ngResource',
    'ngDialog',
    'angularMoment',
    'accountManagement', 
    'habitManagement', 
    'calendarManagement',
    'AccountCtrl',
    'DashboardCtrl',
    'HomeCtrl'])

.config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
        
            // route for the home page
            .state('app', {
                url:'/',
                views: {
                    'header': {
                        templateUrl : 'views/header.html',
                        controller : 'HeaderCtrl'
                    },
                    'content': {
                        templateUrl : 'views/home.html',
                        controller  : 'HomeCtrl'
                    }
                }

            })

            // route for the dashboard page
            .state('app.dashboard', {
                url:'dashboard',
                views: {
                    'content@': {
                        templateUrl : 'views/dashboard.html',
                        controller  : 'DashboardCtrl'
                    }
                }
            })

            // route for the account page
            .state('app.myaccount', {
                url:'myaccount',
                views: {
                    'content@': {
                        templateUrl : 'views/myaccount.html',
                        controller  : 'AccountCtrl'
                    }
                }

            });
    
        $urlRouterProvider.otherwise('/');
    })
;



// angular.module('trueHabit', ['ui.router','ngResource','ngDialog'])
// .config(function($stateProvider, $urlRouterProvider) {
//         $stateProvider
        
//             // route for the home page
//             .state('app', {
//                 url:'/',
//                 views: {
//                     'header': {
//                         templateUrl : 'views/header.html',
//                         controller  : 'HeaderController'
//                     },
//                     'content': {
//                         templateUrl : 'views/home.html',
//                         controller  : 'HomeController'
//                     }
//                 }

//             })
        
//             // route for the aboutus page
//             .state('app.aboutus', {
//                 url:'aboutus',
//                 views: {
//                     'content@': {
//                         templateUrl : 'views/aboutus.html',
//                         controller  : 'AboutController'                  
//                     }
//                 }
//             })
        
//             // route for the contactus page
//             .state('app.contactus', {
//                 url:'contactus',
//                 views: {
//                     'content@': {
//                         templateUrl : 'views/contactus.html',
//                         controller  : 'ContactController'                  
//                     }
//                 }
//             })

//             // route for the account page
//             .state('app.myaccount', {
//                 url:'myaccount',
//                 views: {
//                     'content@': {
//                         templateUrl : 'views/myaccount.html',
//                         controller  : 'AccountController'
//                     }
//                 }

//             });
    
//         $urlRouterProvider.otherwise('/');
//     })
// ;
