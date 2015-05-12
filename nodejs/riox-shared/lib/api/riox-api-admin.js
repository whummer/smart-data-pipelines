/** 
 * JS APIs for admin functionality. This is in a separate file and
 * should not be exposed to regular users (although permissions
 * are additionally checked server-side).
 * @author whummer
 */

(function() {

var init = function(riox) {

	/* Note: riox-api.js needs to be included first for this to work. */
	var sh = riox;

	/* manage pricing plans */

	sh.delete.plan = function(plan, callback) {
		var id = plan.id ? plan.id : plan;
		return riox.callDELETE(appConfig.services.billing.url + "/plans/" + id, callback);
	}
	sh.save.plan = function(plan, callback) {
		var id = plan.id ? plan.id : plan;
		return riox.callPUT(appConfig.services.billing.url + "/plans/" + id, plan, callback);
	}

	/* manage organizations */

	sh.organizations.all = sh.get.organizations.all = function(callback, errorCallback) {
		var url = servicesConfig.services.organizations.url + "/all";
		return riox.callGET(url, callback, errorCallback);
	};

	/* manage user accounts */

	sh.account = {};

	sh.account.activate = function(user, callback) {
		var id = user.id ? user.id : user;
		var req = {userId: id, active: true};
		return riox.callPOST(appConfig.services.users.url + "/active/" + id, req, callback);
	}
	sh.account.deactivate = function(user, callback) {
		var id = user.id ? user.id : user;
		var req = {userId: id, active: false};
		return riox.callPOST(appConfig.services.users.url + "/active/" + id, req, callback);
	}
	sh.account.active = function(user, callback) {
		var id = user.id ? user.id : user;
		return riox.callGET(appConfig.services.users.url + "/active/" + id, callback);
	}

	return sh;
};

/* expose API */
if(typeof window != "undefined" && window.riox) {
	init(window.riox);
}
if(typeof global != "undefined" && global.riox) {
	init(global.riox);
}
if(typeof module != "undefined") {
	module.exports = init;
}
return init;
})();
