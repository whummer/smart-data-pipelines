'use strict';

angular.module('rioxApp')
  .factory('Auth', function Auth($location, $rootScope, $http, User, $cookieStore, Notifications, $q) {

    var currentUser = {};
    var currentOrganization = {};
    
    /* config/constants */
    var AUTO_LOGIN_AFTER_SIGNUP = false;

    /**
     * Set auth headers for riox JS API.
     */
    var configureRioxApiAuth = function(token, callback) {
    	/* configure riox API */
    	riox.auth({
      	  RIOX_AUTH_NETWORK: "riox",
      	  RIOX_AUTH_TOKEN: token
        }, callback, function(err) {
        	/* error occurred */
        	console.log("Error:", err);
        });
    };

    /**
     * Load organizations of current user.
     */
    var loadOrganizations = function(callback) {
  	  if(!currentUser || (!currentUser.id && !currentUser._id)) return;
  	  if(!currentUser.id) {
  		  currentUser.id = currentUser._id;
  	  }
  	  currentOrganization = {};
  	  riox.organizations(function(orgs) {
  		  currentUser.organizations = orgs;
  		  orgs.forEach(function(org) {
  			 if(org[CREATOR_ID] == currentUser.id) {
  				 org.defaultOrganization = org;
  			 }
  		  });
  		  if(!currentOrganization.id) {
  			  currentOrganization = orgs[0];
  		  }
  		  $rootScope.$apply();
  		  if(typeof callback == "function") callback();
  	  }, callback);
    }

    if($cookieStore.get('token')) {
		currentUser = User.get();
        var deferred = $q.defer();
        var oldPromise = currentUser.$promise;
		currentUser.$promise = deferred.promise;
		oldPromise.then(
			function(user) {
	    		configureRioxApiAuth($cookieStore.get('token'), function(token) {
    				loadOrganizations(function() {
            			deferred.resolve();
            		});
            	});
			}
		);
    }

    return {

      /**
       * Authenticate user and save token
       *
       * @param  {Object}   user     - login info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      login: function(user, callback) {
        var cb = callback || angular.noop;
        var deferred = $q.defer();
        
        var authServ = this;

        var request = {
    		email: user.email,
    		password: user.password
        };

        var authLocalUrl = window.appConfig.services.users.url + "/auth/local";
        if(user[API_KEY]) {
        	authLocalUrl += "/key";
        	request[API_KEY] = user[API_KEY];
        }

        $http.post(authLocalUrl, request).
        success(function(data) {
          $cookieStore.put('token', data.token);
          deferred.resolve(data);
          User.get(function(user) {
        	  currentUser = user;
        	  return configureRioxApiAuth(data.token, function() {
        		  Notifications.loadNotifications();
            	  loadOrganizations(cb);
              });
          });
        }).
        error(function(err) {
          this.logout();
          deferred.reject(err);
          return cb(err);
        }.bind(this));

        return deferred.promise;
      },

      /**
       * Delete access token and user info
       *
       * @param  {Function}
       */
      logout: function() {
        $cookieStore.remove('token');
        currentUser = {};
        riox.auth.reset();
        loadOrganizations();
      },

      /**
       * Create a new user
       *
       * @param  {Object}   user     - user info
       * @param  {Function} callback - optional
       * @return {Promise}
       */
      createUser: function(user, callback) {
        var cb = callback || angular.noop;

        var authServ = this;

        return User.save(user,
          function(data) {
        	if(AUTO_LOGIN_AFTER_SIGNUP) {
                $cookieStore.put('token', data.token);
                configureRioxApiAuth(data.token);
                currentUser = User.get();
        	}
            return cb(user);
          },
          function(err) {
            this.logout();
            return cb(err);
          }.bind(this)).$promise;
      },

      /**
       * Change password
       *
       * @param  {String}   oldPassword
       * @param  {String}   newPassword
       * @param  {Function} callback    - optional
       * @return {Promise}
       */
      changePassword: function(oldPassword, newPassword, callback) {
        var cb = callback || angular.noop;

        return User.changePassword({ id: currentUser._id }, {
          password: oldPassword,
          newPassword: newPassword
        }, function(user) {
          return cb(user);
        }, function(err) {
          return cb(err);
        }).$promise;
      },

      /**
       * Sets the current user to a new objects.
       *
       * @return {Object} user
       */
      setCurrentUser: function(user) {
          var deferred = $q.defer();
    	  currentUser = user;
    	  loadOrganizations(function() {
    		  deferred.resolve();
    	  });
    	  return deferred.promise;
      },

      /**
       * Gets all available info on authenticated user
       *
       * @return {Object} user
       */
      getCurrentUser: function() {
    	if(currentUser._id && !currentUser.id) {
    		currentUser.id = currentUser._id;
    	}
        return currentUser;
      },

      /**
       * Get currently selected organization the user operates under.
       */
      getCurrentOrganization: function() {
      	return currentOrganization;
      },
      setCurrentOrganization: function(org) {
    	return currentOrganization = org;
      },
      loadOrganizations: loadOrganizations,

      /**
       * Check if a user is logged in
       *
       * @return {Boolean}
       */
      isLoggedIn: function() {
        return currentUser.hasOwnProperty('role');
      },

      /**
       * Waits for currentUser to resolve before checking if user is logged in
       */
      isLoggedInAsync: function(cb) {
        if(currentUser.hasOwnProperty('$promise')) {
          currentUser.$promise.then(function() {
            cb(true);
          }).catch(function() {
            cb(false);
          });
        } else if(currentUser.hasOwnProperty('role')) {
          cb(true);
        } else {
          cb(false);
        }
      },

      /**
       * Check if a user is an admin
       *
       * @return {Boolean}
       */
      isAdmin: function() {
    	  return hasRole('admin');
      },

      /**
       * Check if a user has a given role
       *
       * @return {Boolean}
       */
      hasRole: function(role) {
    	  return window.appConfig.userRoles.indexOf(currentUser.role) >= 
    		  window.appConfig.userRoles.indexOf(role);
      },

      /**
       * Get auth token
       */
      getToken: function() {
        return $cookieStore.get('token');
      }

    };
  });
