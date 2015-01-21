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

sh.delete.plan = function(plan, callback) {
	var id = plan.id ? plan.id : plan;
	return riots.callDELETE(appConfig.services.billing.url + "/plans/" + id, callback);
}
sh.save.plan = function(plan, callback) {
	var id = plan.id ? plan.id : plan;
	return riots.callPUT(appConfig.services.billing.url + "/plans/" + id, plan, callback);
}

/* expose API */
return sh;
})();