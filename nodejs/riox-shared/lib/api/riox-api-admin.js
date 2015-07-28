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

	/* GLOBAL CONSTANTS: names for model properties */
	var g = sh.CONSTANTS;

	g.SOURCE_IP = "source-ip";
	g.ORIGIN = "origin";

	var shareHook = (typeof window != "undefined") ? window : global;
	for (key in g) {
		shareHook[key] = sh[key] = g[key];
	}

	/* rating/billing of API calls */
	sh.ratings = sh.ratings || {};
	sh.ratings.logAndPermit = function(access, callback, errorCallback) {
		return riox.callPOST(servicesConfig.ratings.url + "/logAndPermit", access, callback, errorCallback);
	};

	/* manage stream sources */

	sh.streams.sources.all = function(query, callback, errorCallback) {
		var url = servicesConfig.streams.url + "/sources/all?";
		if(query[ORGANIZATION_ID]) {
			url += ORGANIZATION_ID + "=" + query[ORGANIZATION_ID];
		}
		return riox.callGET(url, callback, errorCallback);
	};
	sh.streams._bootstrap = function(options, callback, errorCallback) {
		options = options ? options : {};
		return riox.callPOST(servicesConfig.streams.url + "/_bootstrap", options, callback, errorCallback);
	};

	/* manage pricing plans */

	sh.delete.plan = function(plan, callback) {
		var id = plan.id ? plan.id : plan;
		return riox.callDELETE(servicesConfig.billing.url + "/plans/" + id, callback);
	};
	sh.save.plan = function(plan, callback) {
		var id = plan.id ? plan.id : plan;
		return riox.callPUT(servicesConfig.billing.url + "/plans/" + id, plan, callback);
	};

	/* manage organizations */

	sh.organizations.all = sh.get.organizations.all = function(callback, errorCallback) {
		var url = servicesConfig.organizations.url + "/all";
		return riox.callGET(url, callback, errorCallback);
	};

	/* manage streaming gateway (routing/proxy rules etc.) */

	sh.gateway = {};
	sh.gateway.apply = function(options, callback, errorCallback) {
		if(!options) options = {};
		var url = servicesConfig.gateway.url + "/apply";
		return riox.callPOST(url, options, callback, errorCallback);
	};

	/* manage users */

	sh.users._bootstrap = function(options, callback, errorCallback) {
		options = options ? options : {};
		return riox.callPOST(servicesConfig.users.url + "/_bootstrap", options, callback, errorCallback);
	};

	/* manage user accounts */

	sh.account = {};

	sh.account.activate = function(user, callback) {
		var id = user.id ? user.id : user;
		var req = {userId: id, active: true};
		return riox.callPOST(servicesConfig.users.url + "/active/" + id, req, callback);
	}
	sh.account.deactivate = function(user, callback) {
		var id = user.id ? user.id : user;
		var req = {userId: id, active: false};
		return riox.callPOST(servicesConfig.users.url + "/active/" + id, req, callback);
	}
	sh.account.active = function(user, callback) {
		var id = user.id ? user.id : user;
		return riox.callGET(servicesConfig.users.url + "/active/" + id, callback);
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
