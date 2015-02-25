/** 
 * JS APIs for admin functionality. This is in a separate file and
 * should not be exposed to regular users (although permissions
 * are additionally checked server-side).
 * @author whummer
 */

/* define array index names for model properties */

(function() {

/* Note: riots-api.js needs to be included first for this to work. */
var sh = window.riots;

/* manage pricing plans */

sh.delete.plan = function(plan, callback) {
	var id = plan.id ? plan.id : plan;
	return riots.callDELETE(appConfig.services.billing.url + "/plans/" + id, callback);
}
sh.save.plan = function(plan, callback) {
	var id = plan.id ? plan.id : plan;
	return riots.callPUT(appConfig.services.billing.url + "/plans/" + id, plan, callback);
}

/* manage user accounts */

sh.account = {};

sh.account.activate = function(user, callback) {
	var id = user.id ? user.id : user;
	var req = {userId: id, active: true};
	return riots.callPOST(appConfig.services.users.url + "/active/" + id, req, callback);
}
sh.account.deactivate = function(user, callback) {
	var id = user.id ? user.id : user;
	var req = {userId: id, active: false};
	return riots.callPOST(appConfig.services.users.url + "/active/" + id, req, callback);
}
sh.account.active = function(user, callback) {
	var id = user.id ? user.id : user;
	return riots.callGET(appConfig.services.users.url + "/active/" + id, callback);
}

/* expose API */
return sh;
})();