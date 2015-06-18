'use strict';

angular.module('rioxApp')
.factory('Notifications', function ($resource, $rootScope, $timeout) {

	$rootScope.shared = $rootScope.shared || {};

    var app = {
        all: [],
		unread: [],
		unreadDisplay: "",
    	loadNotifications: function() {
    		if(!riox.isAuth()) {
    			return;
    		}
    		var query = {};
    		var notifs = [];
    		riox.notifications(query, function(accesses) {
    			$.each(accesses, function(idx,el) {
    				el.time = formatDate(el[CREATION_DATE]);
    				if(el[TYPE] == TYPE_ACCESS_REQUEST) {
    					el.type = "Access Request";
    					el.link = "streams.provided({sourceId: '" + el[PARAMS][SOURCE_ID] + "', " +
    						"organizationId: '" + el[PARAMS][REQUESTOR_ID] + "'})";
    				} else if(el[TYPE] == TYPE_ACCESS_UPDATE) {
    					el.type = "Access Update";
    					el.link = "streams.consumed({sourceId: '" + el[PARAMS][SOURCE_ID] + "'})";
    				} else if(el[TYPE] == TYPE_INVITE) {
    					el.type = "Organization Invite";
    					var orgId = el[PARAMS][ORGANIZATION_ID];
    					el.link = "index.settings.organizations";
    				} else {
    					el.link = "#";
    				}
    				if(el[STATUS] == STATUS_UNREAD) {
    					el.statusText = "unresolved";
    				} else if(el[STATUS] == STATUS_READ) {
    					el.statusText = "done";
    				} else {
    					el.statusText = el[STATUS];
    				}
    				notifs.push(el);
    			});
    			$rootScope.$apply(function() {
    				app.all = notifs;
    				app.unread = [];
    				notifs.forEach(function(n) {
    	    			if(n[STATUS] == STATUS_UNREAD) {
    	    				app.unread.push(n);
    	    			}
    	    		});
    				app.unreadDisplay = (!app.unread.length) ? "" : ("(" + app.unread.length + ")");
    			});
    		});
    	}
    };

    var pollNotifications = function() {
    	/* TODO: adjust the interval if we end 
    	 * up doing too much polling! */
		app.loadNotifications();
		var interval = 1000 * 10;
		$timeout(function() {
			pollNotifications();
		}, interval);
	}
    pollNotifications();

    $rootScope.shared.notifications = app;

    return app;
});
