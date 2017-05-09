'use strict';

angular.module('accountManagement', [])
.constant("baseURL", "https://localhost:3443/")

.factory('$localStorage', ['$window', function ($window) {
    return {
        store: function (key, value) {
          console.log("local storage - store");
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
          console.log("local storage - get");
            return $window.localStorage[key] || defaultValue;
        },
        remove: function (key) {
          console.log("local storage - remove");
            $window.localStorage.removeItem(key);
        },
        storeObject: function (key, value) {
          console.log("local storage - storeObject");
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key, defaultValue) {
          console.log("local storage - getObject");
            return JSON.parse($window.localStorage[key] || defaultValue);
        }
    };
}])

.factory('authFactory', ['$resource', '$http', '$localStorage', '$rootScope', '$window', 'baseURL', 'ngDialog', function($resource, $http, $localStorage, $rootScope, $window, baseURL, ngDialog){
    
    var authFac = {};
    var TOKEN_KEY = 'Token';
    var isAuthenticated = false;
    var username = '';
    var authToken;
    var userId;
    

  function loadUserCredentials() {
    console.log("loadUserCredentials");
    var credentials = $localStorage.getObject(TOKEN_KEY,'{}');
    if (credentials.username != undefined) {
      useCredentials(credentials);
    }
  }
 
  function storeUserCredentials(credentials) {
    console.log("storeUserCredentials");
    $localStorage.storeObject(TOKEN_KEY, credentials);
    useCredentials(credentials);
  }
 
  function useCredentials(credentials) {
    console.log("useCredentials");
    isAuthenticated = true;
    username = credentials.username;
    authToken = credentials.token;
 
    // Set the token as header for your requests!
    $http.defaults.headers.common['x-access-token'] = authToken;
    $rootScope.$broadcast('recomputeDaysPerf');
    console.log("BROADCAST - useCredentials");
  }
 
  function destroyUserCredentials() {
    console.log("destroyCredentials");
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['x-access-token'] = authToken;
    $localStorage.remove(TOKEN_KEY);
  }
     
    authFac.login = function(loginData) {
        console.log("authFac - login");
        $resource(baseURL + "users/login")
        .save(loginData,
           function(response) {
              storeUserCredentials({username:loginData.username, token: response.token});
              $rootScope.$broadcast('login:Successful');
              console.log("BROADCAST - login");
              $rootScope.$broadcast('recomputeDaysPerf');
           },
           function(response){
              isAuthenticated = false;
              console.log("authFac - login - FAILED - response: ",response);
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Login Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + '</p><p>' +
                    response.data.err.name + '</p></div>' +
                '<div class="ngdialog-buttons">\
                    <button type="button" class="ngdialog-button ngdialog-button-primary" ng-click=confirm("OK")>OK</button>\
                </div>';
            
                ngDialog.openConfirm({ template: message, plain: 'true'});
           }
        
        );

    };
    
    authFac.logout = function() {
        console.log("authFac - logout");
        $resource(baseURL + "users/logout").get(function(response){
        });
        destroyUserCredentials();
    };
    
    authFac.register = function(registerData) {
        console.log("authFac - register");
        $resource(baseURL + "users/register")
        .save(registerData,
           function(response) {
            console.log("authFac - register - save worked");
              authFac.login({username:registerData.username, password:registerData.password});
            if (registerData.rememberMe) {
                $localStorage.storeObject('userinfo',
                    {username:registerData.username, password:registerData.password});
            }
           
              $rootScope.$broadcast('registration:Successful');
              console.log("BROADCAST - register");
              $rootScope.$broadcast('recomputeDaysPerf');
           },
           function(response){
            
            console.log("authFac - register - save DIDN'T WORK");
              var message = '\
                <div class="ngdialog-message">\
                <div><h3>Registration Unsuccessful</h3></div>' +
                  '<div><p>' +  response.data.err.message + 
                  '</p><p>' + response.data.err.name + '</p></div>';

                ngDialog.openConfirm({ template: message, plain: 'true'});

           }
        
        );
    };
    
    authFac.isAuthenticated = function() {
        console.log("authFac - isAuthenticated: ",isAuthenticated);
        return isAuthenticated;
    };
    
    authFac.getUsername = function() {
        console.log("authFac - getUsername: ",username);
        return username;  
    };

    loadUserCredentials();
    
    return authFac;
    
}])
;