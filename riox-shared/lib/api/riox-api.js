/**
 * @author whummer
 */

(function(H){function v(c,a,b){var g=0,d=[],f=0,e,h,n,l,m,F,r,p=!1,k=!1,q=[],t=[],u,y=!1;b=b||{};e=b.encoding||"UTF8";u=b.numRounds||1;n=z(a,e);if(u!==parseInt(u,10)||1>u)throw Error("numRounds must a integer >= 1");F=function(a,b){return A(a,b,c)};r=function(a,b,f,d){var g,e;if("SHA-224"===c||"SHA-256"===c)g=(b+65>>>9<<4)+15,e=16;else throw Error("Unexpected error in SHA-2 implementation");for(;a.length<=g;)a.push(0);a[b>>>5]|=128<<24-b%32;a[g]=b+f;f=a.length;for(b=0;b<f;b+=e)d=A(a.slice(b, b+e),d,c);if("SHA-224"===c)a=[d[0],d[1],d[2],d[3],d[4],d[5],d[6]];else if("SHA-256"===c)a=d;else throw Error("Unexpected error in SHA-2 implementation");return a};if("SHA-224"===c)m=512,l=224;else if("SHA-256"===c)m=512,l=256;else throw Error("Chosen SHA variant is not supported");h=w(c);this.setHMACKey=function(a,b,d){var f;if(!0===k)throw Error("HMAC key already set");if(!0===p)throw Error("Cannot set HMAC key after finalizing hash");if(!0===y)throw Error("Cannot set HMAC key after calling update"); e=(d||{}).encoding||"UTF8";b=z(b,e)(a);a=b.binLen;b=b.value;f=m>>>3;d=f/4-1;if(f<a/8){for(b=r(b,a,0,w(c));b.length<=d;)b.push(0);b[d]&=4294967040}else if(f>a/8){for(;b.length<=d;)b.push(0);b[d]&=4294967040}for(a=0;a<=d;a+=1)q[a]=b[a]^909522486,t[a]=b[a]^1549556828;h=F(q,h);g=m;k=!0};this.update=function(a){var b,c,e,l=0,p=m>>>5;b=n(a,d,f);a=b.binLen;c=b.value;b=a>>>5;for(e=0;e<b;e+=p)l+m<=a&&(h=F(c.slice(e,e+p),h),l+=m);g+=l;d=c.slice(l>>>5);f=a%m;y=!0};this.getHash=function(a,b){var e,m,n;if(!0=== k)throw Error("Cannot call getHash after setting HMAC key");n=B(b);switch(a){case "HEX":e=function(a){return C(a,n)};break;case "B64":e=function(a){return D(a,n)};break;case "BYTES":e=E;break;default:throw Error("format must be HEX, B64, or BYTES");}if(!1===p)for(h=r(d,f,g,h),m=1;m<u;m+=1)h=r(h,l,0,w(c));p=!0;return e(h)};this.getHMAC=function(a,b){var e,n,q;if(!1===k)throw Error("Cannot call getHMAC without first setting HMAC key");q=B(b);switch(a){case "HEX":e=function(a){return C(a,q)};break;case "B64":e= function(a){return D(a,q)};break;case "BYTES":e=E;break;default:throw Error("outputFormat must be HEX, B64, or BYTES");}!1===p&&(n=r(d,f,g,h),h=F(t,w(c)),h=r(n,l,m,h));p=!0;return e(h)}}function k(){}function I(c,a,b){var g=c.length,d,f,e,h,n;a=a||[0];b=b||0;n=b>>>3;if(0!==g%2)throw Error("String of HEX type must be in byte increments");for(d=0;d<g;d+=2){f=parseInt(c.substr(d,2),16);if(isNaN(f))throw Error("String of HEX type contains invalid characters");h=(d>>>1)+n;for(e=h>>>2;a.length<=e;)a.push(0); a[e]|=f<<8*(3-h%4)}return{value:a,binLen:4*g+b}}function J(c,a,b){var g=[],d,f,e,h,g=a||[0];b=b||0;f=b>>>3;for(d=0;d<c.length;d+=1)a=c.charCodeAt(d),h=d+f,e=h>>>2,g.length<=e&&g.push(0),g[e]|=a<<8*(3-h%4);return{value:g,binLen:8*c.length+b}}function K(c,a,b){var g=[],d=0,f,e,h,n,l,m,g=a||[0];b=b||0;a=b>>>3;if(-1===c.search(/^[a-zA-Z0-9=+\/]+$/))throw Error("Invalid character in base-64 string");e=c.indexOf("=");c=c.replace(/\=/g,"");if(-1!==e&&e<c.length)throw Error("Invalid '=' found in base-64 string"); for(e=0;e<c.length;e+=4){l=c.substr(e,4);for(h=n=0;h<l.length;h+=1)f="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(l[h]),n|=f<<18-6*h;for(h=0;h<l.length-1;h+=1){m=d+a;for(f=m>>>2;g.length<=f;)g.push(0);g[f]|=(n>>>16-8*h&255)<<8*(3-m%4);d+=1}}return{value:g,binLen:8*d+b}}function C(c,a){var b="",g=4*c.length,d,f;for(d=0;d<g;d+=1)f=c[d>>>2]>>>8*(3-d%4),b+="0123456789abcdef".charAt(f>>>4&15)+"0123456789abcdef".charAt(f&15);return a.outputUpper?b.toUpperCase():b}function D(c, a){var b="",g=4*c.length,d,f,e;for(d=0;d<g;d+=3)for(e=d+1>>>2,f=c.length<=e?0:c[e],e=d+2>>>2,e=c.length<=e?0:c[e],e=(c[d>>>2]>>>8*(3-d%4)&255)<<16|(f>>>8*(3-(d+1)%4)&255)<<8|e>>>8*(3-(d+2)%4)&255,f=0;4>f;f+=1)8*d+6*f<=32*c.length?b+="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(e>>>6*(3-f)&63):b+=a.b64Pad;return b}function E(c){var a="",b=4*c.length,g,d;for(g=0;g<b;g+=1)d=c[g>>>2]>>>8*(3-g%4)&255,a+=String.fromCharCode(d);return a}function B(c){var a={outputUpper:!1,b64Pad:"="}; c=c||{};a.outputUpper=c.outputUpper||!1;a.b64Pad=c.b64Pad||"=";if("boolean"!==typeof a.outputUpper)throw Error("Invalid outputUpper formatting option");if("string"!==typeof a.b64Pad)throw Error("Invalid b64Pad formatting option");return a}function z(c,a){var b;switch(a){case "UTF8":case "UTF16BE":case "UTF16LE":break;default:throw Error("encoding must be UTF8, UTF16BE, or UTF16LE");}switch(c){case "HEX":b=I;break;case "TEXT":b=function(b,c,f){var e=[],h=[],n=0,l,m,k,r,p,e=c||[0];c=f||0;k=c>>>3;if("UTF8"=== a)for(l=0;l<b.length;l+=1)for(f=b.charCodeAt(l),h=[],128>f?h.push(f):2048>f?(h.push(192|f>>>6),h.push(128|f&63)):55296>f||57344<=f?h.push(224|f>>>12,128|f>>>6&63,128|f&63):(l+=1,f=65536+((f&1023)<<10|b.charCodeAt(l)&1023),h.push(240|f>>>18,128|f>>>12&63,128|f>>>6&63,128|f&63)),m=0;m<h.length;m+=1){p=n+k;for(r=p>>>2;e.length<=r;)e.push(0);e[r]|=h[m]<<8*(3-p%4);n+=1}else if("UTF16BE"===a||"UTF16LE"===a)for(l=0;l<b.length;l+=1){f=b.charCodeAt(l);"UTF16LE"===a&&(m=f&255,f=m<<8|f>>>8);p=n+k;for(r=p>>> 2;e.length<=r;)e.push(0);e[r]|=f<<8*(2-p%4);n+=2}return{value:e,binLen:8*n+c}};break;case "B64":b=K;break;case "BYTES":b=J;break;default:throw Error("format must be HEX, TEXT, B64, or BYTES");}return b}function t(c,a){return c>>>a|c<<32-a}function L(c,a,b){return c&a^~c&b}function M(c,a,b){return c&a^c&b^a&b}function N(c){return t(c,2)^t(c,13)^t(c,22)}function O(c){return t(c,6)^t(c,11)^t(c,25)}function P(c){return t(c,7)^t(c,18)^c>>>3}function Q(c){return t(c,17)^t(c,19)^c>>>10}function R(c,a){var b= (c&65535)+(a&65535);return((c>>>16)+(a>>>16)+(b>>>16)&65535)<<16|b&65535}function S(c,a,b,g){var d=(c&65535)+(a&65535)+(b&65535)+(g&65535);return((c>>>16)+(a>>>16)+(b>>>16)+(g>>>16)+(d>>>16)&65535)<<16|d&65535}function T(c,a,b,g,d){var f=(c&65535)+(a&65535)+(b&65535)+(g&65535)+(d&65535);return((c>>>16)+(a>>>16)+(b>>>16)+(g>>>16)+(d>>>16)+(f>>>16)&65535)<<16|f&65535}function w(c){var a,b;a=[3238371032,914150663,812702999,4144912697,4290775857,1750603025,1694076839,3204075428];b=[1779033703,3144134277, 1013904242,2773480762,1359893119,2600822924,528734635,1541459225];switch(c){case "SHA-224":c=a;break;case "SHA-256":c=b;break;case "SHA-384":c=[new k,new k,new k,new k,new k,new k,new k,new k];break;case "SHA-512":c=[new k,new k,new k,new k,new k,new k,new k,new k];break;default:throw Error("Unknown SHA variant");}return c}function A(c,a,b){var g,d,f,e,h,n,l,m,k,r,p,t,q,v,u,y,w,z,A,B,C,D,x=[],E;if("SHA-224"===b||"SHA-256"===b)r=64,t=1,D=Number,q=R,v=S,u=T,y=P,w=Q,z=N,A=O,C=M,B=L,E=G;else throw Error("Unexpected error in SHA-2 implementation"); b=a[0];g=a[1];d=a[2];f=a[3];e=a[4];h=a[5];n=a[6];l=a[7];for(p=0;p<r;p+=1)16>p?(k=p*t,m=c.length<=k?0:c[k],k=c.length<=k+1?0:c[k+1],x[p]=new D(m,k)):x[p]=v(w(x[p-2]),x[p-7],y(x[p-15]),x[p-16]),m=u(l,A(e),B(e,h,n),E[p],x[p]),k=q(z(b),C(b,g,d)),l=n,n=h,h=e,e=q(f,m),f=d,d=g,g=b,b=q(m,k);a[0]=q(b,a[0]);a[1]=q(g,a[1]);a[2]=q(d,a[2]);a[3]=q(f,a[3]);a[4]=q(e,a[4]);a[5]=q(h,a[5]);a[6]=q(n,a[6]);a[7]=q(l,a[7]);return a}var G;G=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221, 3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063, 1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];"function"===typeof define&&define.amd?define(function(){return v}):"undefined"!==typeof exports?"undefined"!==typeof module && module.exports?module.exports=exports=v:exports=v:H.jsSHA=v})(this);

(function () {

	/* CONFIGURATIONS */

	/**
	 * openConnectionPerRequest
	 *    if true, open a websocket connection for each subscription,
	 *    if false, re-use a single websocket connection (TODO implement)
	 */
	var openConnectionPerRequest = true;
	var ttl = 15000;

	/* END OF CONFIGURATIONS */

	/* Global riox object to hook all methods onto */
	var sh = {};

	/* GLOBAL CONSTANTS: names for model properties */
	var g = sh.CONSTANTS = {};

	g.ID = "id";
	g.NAME = "name";
	g.DESCRIPTION = "description";
	g.CREATION_DATE = "creation-date";
	g.CREATOR_ID = "creator-id";
	g.TYPE = "type";
	g.TYPE_ACCESS_REQUEST = "ACCESS_REQUEST";
	g.TYPE_ACCESS_UPDATE = "ACCESS_UPDATE";
	g.TYPE_CONSENT_UPDATE = "CONSENT_UPDATE";
	g.TYPE_DATA_SCHEMA = "DATA_SCHEMA";
	g.TYPE_DATA_ITEM = "DATA_ITEM";
	g.TYPE_METHOD = "METHOD";
	g.TYPE_INVITE = "INVITE";
	g.TYPE_FIXED_PRICE = "FIXED";
	g.TYPE_VARIABLE_PRICE = "VARIABLE";
	g.PERIOD = "period";
	g.THING_TYPE = "thing-type";
	g.THING_ID = "thing-id";
	g.THINGS = "things";
	g.URL = "url";
	g.DEACTIVATED = "deactivated";
	g.PROPERTIES = "properties";
	g.PROPERTY_ID = "property-id";
	g.PROPERTY_NAME = "property";
	g.PROPERTY_VALUE = "value";
	g.PROPERTY_TYPE = "data-type";
	g.OPTIONS = "options";
	g.UNIT = "unit";
	g.TIMESTAMP = "timestamp";
	g.TIMEUNIT = "time-unit";
	g.TIMEUNIT_MONTH = "MONTH";
	g.TIMEUNIT_DAY = "DAY";
	g.TIMEUNIT_HOUR = "HOUR";
	g.TIMEUNIT_MINUTE = "MINUTE";
	g.TIME_FROM = "from";
	g.TIME_TO = "to";
	g.DOMAIN_NAME = "domain";
	g.IMAGE_DATA = "image-data";
	g.INVITER_ID = "inviter-id";
	g.SIMULATION_ID = "simulation-id";
	g.START_TIME = "start-time";
	g.END_TIME = "end-time";
	g.USER_ID = "user-id";
	g.FIRSTNAME = "firstname";
	g.LASTNAME = "lastname";
	g.EMAIL = "email";
	g.ADDRESS = "address";
	g.PASSWORD = "password";
	g.ROLE = "role";
	g.HOST = "host";
	g.ACCESSROLE_ID = "role-id";
	g.PIPE_ID = "pipe-id";
	g.SOURCE_ID = "source-id";
	g.PROCESSOR_ID = "processor-id";
	g.SINK_ID = "sink-id";
	g.PIPE_DEFINITION = "pipe-definition";
	g.PIPE_ICON = 'icon';
	g.PIPE_ELEMENTS = "elements";
	g.PIPE_ELEMENT_SUBTYPE = "subtype";
	g.PIPE_ELEMENT_OPTIONS = "options";
	g.PIPE_ELEMENT_OPTION_DEFAULT = "default";
	g.AMOUNT = "amount";
	g.ALLOW_CORS = "allow-cors";
	g.ORGANIZATION_ID = "organization-id";
	g.PROCESSORS = "processors";
	g.PROVIDER_ID = "provider-id";
	g.REQUESTOR_ID = "requestor-id";
	g.CONSENTOR_ID = "consentor-id";
	g.RECIPIENT_ID = "recipient-id";
	g.INVOCATION_ID = "invocation-id";
	g.CONNECTOR = "connector";
	g.MEMBER = "member";
	g.TAGS = "tags";
	g.TEXT = "text";
	g.PARAMS = "params";
	g.CREATED = "created";
	g.CHANGED = "changed";
	g.STATUS = "status";
	g.STATUS_REQUESTED = "REQUESTED";
	g.STATUS_PENDING = "PENDING";
	g.STATUS_CONFIRMED = "CONFIRMED";
	g.STATUS_PERMITTED = "PERMITTED";
	g.STATUS_DENIED = "DENIED";
	g.STATUS_REJECTED = "REJECTED";
	g.STATUS_UNKNOWN = "UNKNOWN";
	g.STATUS_UNREAD = "UNREAD";
	g.STATUS_READ = "READ";
	g.STATUS_DELETED = "DELETED";
	g.RESULT_STATUS = "result-status";
	g.PERMIT_MODE = "permit";
	g.PERMIT_MODE_AUTO = "AUTO";
	g.PERMIT_MODE_MANUAL = "MANUAL";
	g.PORT = "port";
	g.ENDPOINT = "endpoint";
	g.BACKEND_ENDPOINTS = "backends";
	g.VISIBLE = "visible";
	g.INPUT = "input";
	g.OUTPUT = "output";
	g.PAYLOAD = "payload";
	g.KEY = "key";
	g.VALUE = "value";
	g.VALUE_TYPE = "value-type";
	g.VALID_VALUES = "valid-values";
	g.SECURITY = "security";
	g.RETENTION_TIME = "retention-time";
	g.DATA_INTERFACES = "data-interfaces";
	g.PRICING = "pricing";
	g.PRICING_ITEMS = "pricing-items";
	g.DATA_OUT = "data-out";
	g.SELECTOR = "selector";
	g.HTTP_METHOD = "http-method";
	g.SOURCE_IP = "source-ip";
	g.SOURCE_COUNTRY = "source-country";
	g.URL_PATH = "url-path";
	g.URL_QUERY = "url-query";
	g.PUBLIC_ACCESS = "public-access";
	g.DISABLE_LOG = "disable-log";
	g.MAPPED_PATH = "mapped-path";
	g.OPERATIONS = "operations";
	g.OPERATION_ID = "operation-id";
	g.SCHEMAS = "schemas";
	g.SCHEMA_IN = "schema-in";
	g.SCHEMA_OUT = "schema-out";
	g.CERTIFICATE = "certificate";
	g.DATA_ITEMS = "data-items";
	g.HREF = "href";
	g.CERT_FILE = "cert-file";
	g.PK_FILE = "pk-file";
	g.API_KEYS = "api-keys";
	g.API_KEY = "api-key";
	g.LIMITS = "limits";
	g.LIMIT_API_KEYS = "API_KEYS";
	g.LIMIT_DATA_MESSAGES = "DATA_MESSAGES";
	g.CONSUMER_ID = "consumer-id";
	g.ACTIVATION_KEY = "activation-key";
	g.ACTIVATION_DATE = "activation-date";
	g.MSGTYPE_SUBSCRIBE = "SUBSCRIBE";
	g.MSGTYPE_DATA = "DATA";
	g.METRIC_REQUESTS = "REQUESTS";


	var shareHook = (typeof window != "undefined") ? window : global;
	Object.keys(g).forEach(function (gKey) {
		shareHook[gKey] = sh[gKey] = g[gKey];
	});
	/*for (key in g) {
	 shareHook[key] = sh[key] = g[key];
	 }*/

	/* initialize authentication info */
	sh.login = function (options, callback, errorCallback) {
		var shaObj = new jsSHA(options.password, "TEXT");
		options.password = shaObj.getHash("SHA-256", "HEX");
		callPOST(servicesConfig.users.url + "/login", options, callback, errorCallback);
	};
	var assertAuth = function () {
		var ok = sh.authToken &&
				((sh.authToken.userId && sh.authToken.appKey) ||
				(sh.authToken.network && sh.authToken.access_token));
		if (!ok) {
			console.log(sh.authToken);
			console.trace();
			throw "Please provide valid authentication information.";
		}
	};

	/* register/authenticate user */

	sh.activate = function (actKey, callback, errorCallback) {
		var req = {activationKey: actKey};
		return callPOST(servicesConfig.users.url + "/activation", req, callback, errorCallback);
	};
	sh.signup = function (userInfo, callback, errorCallback) {
		return callPOST(servicesConfig.users.url + "/", userInfo, callback, errorCallback);
	};
	sh.signin = function (userInfo, callback, errorCallback) {
		return callPOST(servicesConfig.users.url + "/auth/local", userInfo, function (token, a1, a2) {
			if (!token.token) {
				if (errorCallback) errorCallback("Cannot read token from auth result: " + token);
			} else {
				if (!callback || !callback.dontSetToken) {
					sh.auth({
						RIOX_AUTH_NETWORK: "riox",
						RIOX_AUTH_TOKEN: token.token
					}, callback, errorCallback);
				}
			}
		}, errorCallback);
	};
	sh.auth = function (options, callback, errorCallback) {
		var authToken = sh.authToken = {};
		authToken.userId = (options && options.RIOX_USER_ID) ? options.RIOX_USER_ID : (typeof window != "undefined") ? window.RIOX_USER_ID : undefined;
		authToken.appKey = (options && options.RIOX_APP_KEY) ? options.RIOX_APP_KEY : (typeof window != "undefined") ? window.RIOX_APP_KEY : undefined;
		authToken.network = (options && options.RIOX_AUTH_NETWORK) ? options.RIOX_AUTH_NETWORK : (typeof window != "undefined") ? window.RIOX_AUTH_NETWORK : undefined;
		authToken.access_token = (options && options.RIOX_AUTH_TOKEN) ? options.RIOX_AUTH_TOKEN : (typeof window != "undefined") ? window.RIOX_AUTH_TOKEN : undefined;
		assertAuth();
		var __defaultHeaders = {
			"Content-Type": "application/json",
			"authorization": "Bearer " + authToken.access_token
		};
		if (typeof $ != "undefined") {
			$.ajaxSetup({
				headers: __defaultHeaders
			});
		}
		var funcSuccess = function (result) {
			if (callback) {
				callback(result);
			}
		};
		var funcError = function (result) {
			if (errorCallback) {
				errorCallback(result);
			}
		};
		if (!options.dontInvokeService) {
			if (authToken.appKey) {
				riox.app({
					appKey: authToken.appKey
				}, funcSuccess, funcError);
			} else {
				var authToken = {
					network: authToken.network,
					token: authToken.access_token
				};
				callPOST(servicesConfig.users.url + "/auth", authToken, funcSuccess, funcError);
			}
		}
	};
	sh.isAuth = function () {
		return sh.authToken && sh.authToken.access_token && sh.authToken.access_token != "__invalid__";
	};
	sh.signout = sh.auth.reset = function (options, callback, errorCallback) {
		sh.auth({
			RIOX_AUTH_NETWORK: "riox",
			RIOX_AUTH_TOKEN: "__invalid__",
			dontInvokeService: true
		});
	};
	sh.recover = sh.auth.recover = function (options, callback, errorCallback) {
		callPOST(servicesConfig.users.url + "/recover", options, callback, errorCallback);
	};

	/* methods for GETting data */

	sh.get = {};

	sh.app = sh.get.app = function (opts, callback, errorCallback) {
		if (!opts) {
			if (callback) callback(null);
			return null;
		}
		var path = "/" + opts;
		if (opts.appKey) {
			path = "/by/appKey/" + opts.appKey;
		}
		return callGET(servicesConfig.apps.url + path, callback, errorCallback);
	};
	sh.me = function (callback, errorCallback) {
		return callGET(servicesConfig.users.url + "/me", callback, errorCallback);
	};
	sh.users = sh.get.users = function (callback, errorCallback) {
		return callGET(servicesConfig.users.url, callback, errorCallback);
	};
	sh.user = sh.get.user = function (query, callback, errorCallback) {
		var url = servicesConfig.users.url;
		if (query[ID]) {
			url += "/" + query[ID];
		} else if (query[EMAIL] || query[NAME]) {
			url += "/search?email=" + query[EMAIL] + "&name=" + query[NAME];
		} else {
			throw "invalid user query";
		}
		return callGET(url, callback, errorCallback);
	};
	sh.actions = sh.get.actions = function (opts, callback, errorCallback) {
		return callPOST(servicesConfig.users.url + "/actions/query", opts, callback, errorCallback);
	};
	sh.apps = sh.get.apps = function (callback, errorCallback) {
		return callGET(servicesConfig.apps.url, callback, errorCallback);
	};
	sh.thingType = sh.get.thingType = function (id, callback, errorCallback) {
		if (!id) {
			if (callback) callback(null);
			return null;
		}
		return callGET(servicesConfig.thingTypes.url + "/" + id, callback, errorCallback);
	};
	sh.thingTypes = sh.get.thingTypes = function (callback, errorCallback) {
		var maxThings = 100;
		return callGET(servicesConfig.thingTypes.url + "?page=0&size=" + maxThings, callback, errorCallback);
	};
	sh.things = sh.get.things = function (opts, callback, errorCallback) {
		if (!opts) opts = {};
		var maxResults = opts.maxResults ? opts.maxResults : 100;
		var suffix = "?page=0&size=" + maxResults;
		if (opts.appId) {
			suffix = "/by/application/" + opts.appId;
		}
		return callGET(servicesConfig.things.url + suffix, callback, errorCallback);
	};
	sh.thing = sh.get.thing = function (id, callback, errorCallback) {
		if (!id) {
			if (callback) callback(null);
			return null;
		}
		return callGET(servicesConfig.things.url + "/" + id, callback, errorCallback);
	};
	sh.triggers = sh.get.triggers = function (callback, errorCallback) {
		return callGET(servicesConfig.triggers.url, callback, errorCallback);
	};
	sh.certificates = sh.get.certificates = function (callback, errorCallback) {
		return callGET(servicesConfig.certificates.url, callback, errorCallback);
	};
	sh.statistics = sh.get.statistics = {};
	sh.statistics.invocations = sh.get.statistics.invocations = function (query, callback, errorCallback) {
		var url = servicesConfig.statistics.url + "/invocations";
		return callPOST(url, query, callback, errorCallback);
	};

	sh.pipe = {};
	sh.pipes = {};
	sh.get.pipes = {};

	sh.pipes = sh.get.pipes = function (searchOpts, callback, errorCallback) {

		var url = servicesConfig.pipes.url;
		if (searchOpts && typeof searchOpts.query != "undefined") {
			url += "/query";
			return callPOST(url, searchOpts, callback, errorCallback);
		}

		if (searchOpts && typeof searchOpts == 'string') {
			return callGET(url + '/' + searchOpts, callback, errorCallback);
		}

		return callGET(url, callback, errorCallback);
	};

	sh.pipeelements = sh.get.pipeelements = function (searchOpts, callback, errorCallback) {

		var url = servicesConfig.pipeelements.url;
		if (searchOpts && typeof searchOpts.query != "undefined") {
			url += "/query";
			return callPOST(url, searchOpts, callback, errorCallback);
		}

		if (searchOpts && typeof searchOpts == 'string') {
			return callGET(url + '/' + searchOpts, callback, errorCallback);
		}

		return callGET(url, callback, errorCallback);
	};

	/*
	 sh.pipes.sources = sh.get.pipes.sources = function (searchOpts, callback, errorCallback) {
	 var url = servicesConfig.pipes.url + "/sources";
	 if (searchOpts && typeof searchOpts.query != "undefined") {
	 url += "/query";
	 return callPOST(url, searchOpts, callback, errorCallback);
	 }
	 return callGET(url, callback, errorCallback);
	 };

	 sh.pipes.source = sh.get.pipes.source = function (id, callback, errorCallback) {
	 if (!id) {
	 if (callback) callback(null);
	 return null;
	 }
	 return callGET(servicesConfig.pipes.url + "/sources/" + id, callback, errorCallback);
	 };
	 sh.pipes.consumed = function (searchOpts, callback, errorCallback) {
	 var url = servicesConfig.pipes.url + "/consumed";
	 return callGET(url, callback, errorCallback);
	 };
	 sh.pipes.provided = function (searchOpts, callback, errorCallback) {
	 var url = servicesConfig.pipes.url + "/provided";
	 if(searchOpts[NAME]) {
	 url += "/by/name/" + searchOpts[NAME];
	 }
	 return callGET(url, callback, errorCallback);
	 };
	 sh.pipes.sinks = sh.get.pipes.sinks = function (searchOpts, callback, errorCallback) {
	 var url = servicesConfig.pipesinks.url;
	 return callGET(url, callback, errorCallback);
	 };
	 sh.pipes.processor = function (id, callback, errorCallback) {
	 if (!id) {
	 if (callback) callback(null);
	 return null;
	 }
	 return callGET(servicesConfig.pipeprocessors.url + "/" + id, callback, errorCallback);
	 };
	 sh.pipes.processors = function (searchOpts, callback, errorCallback) {
	 var url = servicesConfig.pipeprocessors.url;
	 return callGET(url, callback, errorCallback);
	 };*/
	sh.analytics = sh.get.analytics = function (callback, errorCallback) {
		var url = servicesConfig.analytics.url;
		return callGET(url, callback, errorCallback);
	};
	sh.manufacturers = sh.get.manufacturers = function (callback, errorCallback) {
		return callGET(servicesConfig.manufacturers.url, callback, errorCallback);
	};
	sh.stats = sh.get.stats = function (opts, callback, errorCallback) {
		var url = buildQueryURL(servicesConfig.stats.url, opts);
		return callGET(url, callback, errorCallback);
	};
	sh.simulationTypes = sh.get.simulationTypes = function (callback, errorCallback) {
		var maxResults = 100;
		return callGET(servicesConfig.simulationTypes.url + "?page=0&size=" + maxResults, callback, errorCallback);
	};
	sh.notifications = sh.get.notifications = function (opts, callback, errorCallback) {
		return callGET(servicesConfig.notifications.url, callback, errorCallback);
	};
	sh.simulations = sh.get.simulations = function (callback, errorCallback) {
		var maxResults = 100;
		return callGET(servicesConfig.simulations.url + "?page=0&size=" + maxResults, callback, errorCallback);
	};
	sh.simulationByThingIdAndPropertyName = sh.get.simulationByThingIdAndPropertyName = function (opts, callback, errorCallback) {
		var maxResults = 100;
		var thingId = opts.thingId;
		var propertyName = opts.propertyName;
		return callGET(servicesConfig.simulations.url + "?page=0&size=" + maxResults + "&thingId="
				+ thingId + "&propertyName=" + propertyName, callback, errorCallback);
	};
	sh.proxies = sh.get.proxies = function (searchOpts, callback, errorCallback) {
		var url = servicesConfig.proxies.url;
		return callGET(url, callback, errorCallback);
	};

	sh.data = sh.get.data = function (opts, callback, errorCallback) {
		var url = servicesConfig.thingData.url + "/" +
				opts[THING_ID] + "/" + opts[PROPERTY_NAME];
		if (opts.amount) {
			url += "/history?amount=" + opts.amount;
		}
		return callGET(url, callback, errorCallback);
	};
	sh.config = sh.get.config = function (callback, errorCallback) {
		assertAuth();
		var url = servicesConfig.users.url + "/by/email/" + authInfo.email + "/config";
		return callGET(url, callback, errorCallback);
	};
	sh.driver = sh.get.driver = function (opts, callback, errorCallback) {
		var url = servicesConfig.drivers.url + "/forThing/" +
				opts[THING_ID] + "/" + opts[PROPERTY_NAME];
		return callGET(url, callback, errorCallback);
	};
	sh.plans = sh.get.plans = function (callback, errorCallback) {
		var url = servicesConfig.billing.url + "/plans";
		return callGET(url, callback, errorCallback);
	};
	sh.organizations = sh.get.organizations = function (query, callback, errorCallback) {
		if (typeof query == "function" || typeof query.callback == "function") {
			errorCallback = callback;
			callback = query;
		}
		var url = servicesConfig.organizations.url;
		if (query.all) url += "/all";
		return callGET(url, callback, errorCallback);
	};
	sh.organizations.memberships = sh.get.organizations.memberships = function (org, callback, errorCallback) {
		var orgId = org[ID] ? org[ID] : org;
		if (typeof orgId != "string") throw "Please provide a valid organization ID.";
		var url = servicesConfig.organizations.url + "/" + orgId + "/memberships";
		return callGET(url, callback, errorCallback);
	};
	sh.organizations.memberships = sh.get.organizations.memberships = function (org, callback, errorCallback) {
		var orgId = org[ID] ? org[ID] : org;
		if (typeof orgId != "string") throw "Please provide a valid organization ID.";
		var url = servicesConfig.organizations.url + "/" + orgId + "/memberships";
		return callGET(url, callback, errorCallback);
	};
	sh.organization = sh.get.organization = function (org, callback, errorCallback) {
		var id = org.id ? org.id : org;
		var url = servicesConfig.organizations.url + "/" + id;
		return callGET(url, callback, errorCallback);
	};
	sh.organization.membership = sh.get.organization.membership = function (mem, callback, errorCallback) {
		var memId = mem[ID] ? mem[ID] : mem;
		if (typeof memId != "string") throw "Please provide a valid membership ID.";
		var url = servicesConfig.organizations.url + "/memberships/" + memId;
		return callGET(url, callback, errorCallback);
	};
	sh.access = sh.get.access = function (query, callback, errorCallback) {
		if (typeof callback == "undefined") {
			callback = query;
			query = {};
		}
		var sourceId = query[SOURCE_ID];
		var consumerId = query[REQUESTOR_ID];
		var url = servicesConfig.access.url +
				(sourceId ? ("/source/" + sourceId) : "") +
				(consumerId ? ("/consumer/" + consumerId) : "");
		return callGET(url, callback, errorCallback);
	};
	sh.access.roles = sh.get.access.roles = function (callback, errorCallback) {
		var url = servicesConfig.access.url + "/roles";
		return callGET(url, callback, errorCallback);
	};
	sh.access.consumers = sh.get.access.consumers = function (query, callback, errorCallback) {
		var url = servicesConfig.access.url + "/consumers";
		if (query[SOURCE_ID]) {
			url += "?source=" + query[SOURCE_ID];
		}
		return callGET(url, callback, errorCallback);
	};
	sh.access.consumer = sh.get.access.consumer = function (consumer, callback, errorCallback) {
		var url = servicesConfig.access.url + "/consumers/";
		url += consumer[API_KEY] ? consumer[API_KEY] : consumer[ID] ? consumer[ID] : consumer;
		return callGET(url, callback, errorCallback);
	};
	sh.ratings = sh.get.ratings = sh.get.ratings || {};
	sh.ratings.limits = sh.get.ratings.limits = function (query, callback, errorCallback) {
		var url = servicesConfig.ratings.url + "/limits";
		if (query[SOURCE_ID]) {
			url += "?source=" + query[SOURCE_ID];
		}
		return callGET(url, callback, errorCallback);
	};
	sh.ratings.invocations = sh.get.ratings.invocations = function (query, callback, errorCallback) {
		var url = servicesConfig.ratings.url + "/invocations";
		return callPOST(url, query, callback, errorCallback);
	};
	sh.pricing = sh.get.pricing = sh.get.pricing || {};
	sh.pricing.plans = sh.get.pricing.plans = function (query, callback, errorCallback) {
		var url = servicesConfig.pricing.url + "/plans";
		return callGET(url, callback, errorCallback);
	};
	sh.consents = sh.get.consents = function (query, callback, errorCallback) {
		if (typeof callback == "undefined") {
			callback = query;
			query = {};
		}
		var sourceId = query[SOURCE_ID];
		var consumerId = query[REQUESTOR_ID];
		var consentorId = query[CONSENTOR_ID];
		var url = servicesConfig.consents.url;
		if (consentorId) {
			url = url + "/user/" + consentorId;
		} else {
			url += (sourceId ? ("/source/" + sourceId) : "") +
					(consumerId ? ("/consumer/" + consumerId) : "");
		}
		return callGET(url, callback, errorCallback);
	};
	sh.usage = sh.get.usage = function (callback, errorCallback) {
		var url = servicesConfig.users.url + "/me/usage";
		return callGET(url, callback, errorCallback);
	};
	sh.properties = sh.get.properties = function (thingType, callback, errorCallback) {
		var maxThings = 100;
		if (!thingType.id) {
			sh.thingType(thingType, function (thingTypeObj) {
				sh.properties(thingTypeObj, callback);
			});
			return;
		}
		/* recurse into sub-types */
		if (thingType.children) {
			$.each(thingType.children, function (idx, el) {
				sh.properties(el, callback);
			});
		}
		if (!thingType.properties) {
			thingType.properties = [];
		}
		callback(thingType.properties, thingType);
		/* recurse into sub-properties */
		if (thingType.properties) {
			var recurseProps = function (prop, callback, propNamePrefix) {
				if (prop.children) {
					$.each(prop.children, function (idx, subProp) {
						subProp = clone(subProp);
						subProp.name = propNamePrefix + subProp.name;
						callback([subProp], thingType);
						recurseProps(subProp, callback, subProp.name + ".");
					});
				}
			}
			$.each(thingType.properties, function (idx, prop) {
				recurseProps(prop, callback, prop.name + ".");
			});
		}
	};

	sh.propertiesRecursive = function (props, includeComplexProps) {
		return doGetPropertiesRecursive(props, undefined, undefined, includeComplexProps);
	}
	var doGetPropertiesRecursive = function (props, result, propNamePrefix, includeComplexProps) {
		if (!result) result = [];
		if (!propNamePrefix) propNamePrefix = "";
		$.each(props, function (idx, prop) {
			if (prop.children) {
				$.each(prop.children, function (idx, subProp) {
					subProp = clone(subProp);
					subProp.name = propNamePrefix + subProp.name;
					sh.propertiesRecursive([subProp], result, subProp.name + ".", includeComplexProps);
				});
			}
			if (includeComplexProps || !prop.children) {
				result.push(prop);
			}
		});
		return result;
	};

	var buildQueryURL = function (baseURL, opts) {
		if (!opts) opts = {};
		var url = baseURL;
		if (opts.type) url += "/" + opts.type;
		url += "?";
		if (opts.query) url += "&q=" + opts.query;
		if (opts.from) url += "&from=" + opts.from;
		if (opts.to) url += "&to=" + opts.to;
		if (opts.period) url += "&period=" + opts.period;
		return url;
	};

	/* methods for POSTing data */

	sh.add = {};

	sh.add.thingType = function (thingType, callback, errorCallback) {
		return callPOST(servicesConfig.thingTypes.url, thingType, callback, errorCallback);
	};
	sh.add.app = function (app, callback, errorCallback) {
		return callPOST(servicesConfig.apps.url, app, callback, errorCallback);
	};
	sh.add.thing = function (thing, callback, errorCallback) {
		return callPOST(servicesConfig.things.url, thing, callback, errorCallback);
	};
	sh.add.simulationType = function (simType, callback, errorCallback) {
		return callPOST(servicesConfig.simulationTypes.url, simType, callback, errorCallback);
	};
	sh.add.trigger = function (trigger, callback, errorCallback) {
		if (!trigger.type) {
			trigger.type = "FUNCTION";
		}
		return callPOST(servicesConfig.triggers.url, trigger, callback, errorCallback);
	};
	sh.add.organization = function (organization, callback, errorCallback) {
		return callPOST(servicesConfig.organizations.url, organization, callback, errorCallback);
	};
	sh.add.organization.invite = function (invite, callback, errorCallback) {
		var orgId = invite[ORGANIZATION_ID];
		if (typeof orgId != "string") throw "Please provide a valid " + ORGANIZATION_ID;
		var url = servicesConfig.organizations.url + "/" + orgId + "/invite";
		return callPOST(url, invite, callback, errorCallback);
	};
	sh.add.notification = function (notification, callback, errorCallback) {
		return callPOST(servicesConfig.notifications.url, notification, callback, errorCallback);
	};
	sh.add.data = function (opts, dataItem, callback, errorCallback) {
		var url = servicesConfig.thingData.url + "/" +
				opts[THING_ID] + "/" +
				opts[PROPERTY_NAME];
		return callPOST(url, dataItem, callback, errorCallback);
	};
	sh.add.access = sh.add.access || {};
	sh.add.access.role = function (role, callback, errorCallback) {
		var url = servicesConfig.access.url + "/roles";
		return callPOST(url, role, callback, errorCallback);
	}
	sh.add.access.consumer = function (consumer, callback, errorCallback) {
		var url = servicesConfig.access.url + "/consumers";
		return callPOST(url, consumer, callback, errorCallback);
	}
	sh.add.access.consumer.key = function (consumer, callback, errorCallback) {
		var id = consumer._id ? consumer._id : consumer.id ? consumer.id : consumer;
		var url = servicesConfig.access.url + "/consumers/" + id + "/keys";
		return callPOST(url, {}, callback, errorCallback);
	}

	sh.add.pipes = {};
	sh.add.pipe = function (obj, callback, errorCallback) {
		console.log("Adding pipe: ", obj)
		return callPOST(servicesConfig.pipes.url, obj, callback, errorCallback);
	};
	sh.add.pipes.source = function (source, callback, errorCallback) {
		return callPOST(servicesConfig.pipesources.url, source, callback, errorCallback);
	};
	sh.add.pipes.sink = function (sink, callback, errorCallback) {
		return callPOST(servicesConfig.pipesinks.url, sink, callback, errorCallback);
	};
	sh.add.pipes.processor = function (processor, callback, errorCallback) {
		return callPOST(servicesConfig.pipeprocessors.url, processor, callback, errorCallback);
	};
	sh.add.proxy = function (obj, callback, errorCallback) {
		return callPOST(servicesConfig.proxies.url, obj, callback, errorCallback);
	};
	sh.add.certificate = function (certificate, callback, errorCallback) {
		return callPOST(servicesConfig.certificates.url, certificate, callback, errorCallback);
	};
	sh.add.rating = sh.add.rating || {};
	sh.add.rating.limit = function (limit, callback, errorCallback) {
		var url = servicesConfig.ratings.url + "/limits";
		return callPOST(url, limit, callback, errorCallback);
	};
	sh.add.pricing = sh.add.pricing || {};
	sh.add.pricing.plan = function (plan, callback, errorCallback) {
		var url = servicesConfig.pricing.url + "/plans";
		return callPOST(url, plan, callback, errorCallback);
	};


	/* methods for PUTting data */

	sh.save = {};

	sh.save.me = function (me, callback, errorCallback) {
		return callPUT(servicesConfig.users.url + "/me", me, callback, errorCallback);
	};
	sh.save.thingType = function (thingType, callback, errorCallback) {
		return callPUT(servicesConfig.thingTypes.url, thingType, callback, errorCallback);
	};
	sh.save.app = function (app, callback, errorCallback) {
		return callPUT(servicesConfig.apps.url, app, callback, errorCallback);
	};
	sh.save.organization = function (organization, callback, errorCallback) {
		return callPUT(servicesConfig.organizations.url + "/" + organization.id, organization, callback, errorCallback);
	};
	sh.save.organization.membership = function (mem, callback, errorCallback) {
		return callPUT(servicesConfig.organizations.url + "/memberships/" + mem.id, mem, callback, errorCallback);
	};
	sh.save.certificate = function (certificate, callback, errorCallback) {
		return callPUT(servicesConfig.certificates.url + "/" + certificate.id, certificate, callback, errorCallback);
	};
	sh.save.thing = function (thing, callback, errorCallback) {
		return callPUT(servicesConfig.things.url, thing, callback, errorCallback);
	};
	sh.save.simulationType = function (simType, callback, errorCallback) {
		return callPUT(servicesConfig.simulationTypes.url, simType, callback, errorCallback);
	};
	sh.save.trigger = function (trigger, callback, errorCallback) {
		return callPUT(servicesConfig.triggers.url, trigger, callback, errorCallback);
	};
	sh.save.notification = function (notification, callback, errorCallback) {
		return callPUT(servicesConfig.notifications.url, notification, callback, errorCallback);
	};

	sh.save.pipe = {};
	sh.save.pipe = function (obj, callback, errorCallback) {
		var id = assertID(obj);
		return callPUT(servicesConfig.pipes.url + "/" + id, obj, callback, errorCallback);
	};
	sh.save.pipeelement = function (sink, callback, errorCallback) {
		var id = assertID(obj);
		return callPUT(servicesConfig.pipeelements.url + "/" + id, sink, callback, errorCallback);
	};
	sh.save.proxy = function (obj, callback, errorCallback) {
		var id = assertID(obj);
		return callPUT(servicesConfig.proxies.url + "/" + id, obj, callback, errorCallback);
	};
	sh.save.driver = function (driver, callback, errorCallback) {
		var url = servicesConfig.drivers.url + "/forThing/" +
				driver[THING_ID] + "/" + driver[PROPERTY_NAME];
		return callPUT(url, driver, callback, errorCallback);
	};
	sh.save.config = function (config, callback, errorCallback) {
		var url = servicesConfig.users.url + "/by/email/" + authInfo.email + "/config";
		return callPUT(url, config, callback, errorCallback);
	};
	sh.save.access = function (access, callback, errorCallback) {
		var url = servicesConfig.access.url;
		if (access.id) {
			url += "/" + access.id;
			return callPUT(url, access, callback, errorCallback);
		} else if (access[SOURCE_ID]) {
			return callPOST(url, access, callback, errorCallback);
		} else {
			throw "Missing either '" + ID + "' or '" + SOURCE_ID + "' of access entity";
		}
	};
	sh.save.access.role = function (role, callback, errorCallback) {
		var url = servicesConfig.access.url + "/roles/" + role.id;
		return callPUT(url, role, callback, errorCallback);
	};
	sh.save.access.consumer = function (consumer, callback, errorCallback) {
		var url = servicesConfig.access.url + "/consumers/" + consumer.id;
		return callPUT(url, consumer, callback, errorCallback);
	};
	sh.save.rating = {};
	sh.save.rating.limit = function (limit, callback, errorCallback) {
		var url = servicesConfig.ratings.url + "/limits/" + limit.id;
		return callPUT(url, limit, callback, errorCallback);
	};
	sh.save.pricing = {};
	sh.save.pricing.plan = function (plan, callback, errorCallback) {
		var url = servicesConfig.pricing.url + "/plans/" + plan.id;
		return callPUT(url, plan, callback, errorCallback);
	};

	/* methods for DELETEing data */

	sh.delete = {};

	sh.delete.thingType = function (thingType, callback, errorCallback) {
		var id = thingType.id ? thingType.id : thingType;
		return callDELETE(servicesConfig.thingTypes.url + "/" + id, callback, errorCallback);
	};
	sh.delete.app = function (app, callback, errorCallback) {
		var id = app.id ? app.id : app;
		return callDELETE(servicesConfig.apps.url + "/" + id, callback, errorCallback);
	};
	sh.delete.thing = function (thing, callback, errorCallback) {
		var id = thing.id ? thing.id : thing;
		return callDELETE(servicesConfig.things.url + "/" + id, callback, errorCallback);
	};
	sh.delete.simulationType = function (simType, callback, errorCallback) {
		var id = simType.id ? simType.id : simType;
		return callDELETE(servicesConfig.simulationTypes.url + "/" + id, callback, errorCallback);
	};
	sh.delete.simulation = function (id, callback, errorCallback) {
		return callDELETE(servicesConfig.simulations.url + "/" + id, callback, errorCallback);
	};
	sh.delete.trigger = function (trigger, callback, errorCallback) {
		var id = trigger.id ? trigger.id : trigger;
		return callDELETE(servicesConfig.triggers.url + "/" + id, callback, errorCallback);
	};
	sh.delete.triggersForCreator = function (creatorId, callback, errorCallback) {
		return callDELETE(servicesConfig.triggers.url + "?creatorId=" + creatorId, callback, errorCallback);
	};
	sh.delete.pipe = function (obj, callback, errorCallback) {
		var id = obj.id ? obj.id : obj;
		return callDELETE(servicesConfig.pipes.url + "/" + id, callback, errorCallback);
	};
	sh.delete.sink = function (sink, callback, errorCallback) {
		var id = sink.id ? sink.id : sink;
		return callDELETE(servicesConfig.pipesinks.url + "/" + id, callback, errorCallback);
	};
	sh.delete.driver = function (opts, callback, errorCallback) {
		var url = servicesConfig.drivers.url + "/resetFor/" +
				opts[THING_ID] + "/" + opts[PROPERTY_NAME];
		return callGET(url, callback, errorCallback);
	};
	sh.delete.access = function (access, callback, errorCallback) {
		var url = servicesConfig.access.url + "/" + access.id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.access.role = function (role, callback, errorCallback) {
		var id = role.id ? role.id : role;
		var url = servicesConfig.access.url + "/roles/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.access.consumer = function (consumer, callback, errorCallback) {
		var id = consumer.id ? consumer.id : consumer;
		var url = servicesConfig.access.url + "/consumers/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.access.consumer.key = function (consumer, key, callback, errorCallback) {
		var id = consumer.id ? consumer.id : consumer;
		var url = servicesConfig.access.url + "/consumers/" + id + "/keys/" + key;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.rating = sh.delete.rating || {};
	sh.delete.rating.limit = function (limit, callback, errorCallback) {
		var id = limit.id ? limit.id : limit;
		var url = servicesConfig.ratings.url + "/limits/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.notification = function (notification, callback, errorCallback) {
		var id = notification.id ? notification.id : notification;
		var url = servicesConfig.notifications.url + "/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.certificate = function (certificate, callback, errorCallback) {
		var id = certificate.id ? certificate.id : certificate;
		var url = servicesConfig.certificates.url + "/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.organization = function (org, callback, errorCallback) {
		var id = org.id ? org.id : org;
		var url = servicesConfig.organizations.url + "/" + id;
		return callDELETE(url, callback, errorCallback);
	};
	sh.delete.organization.membership = function (mem, callback, errorCallback) {
		var id = mem.id ? mem.id : mem;
		var url = servicesConfig.organizations.url + "/memberships/" + id;
		return callDELETE(url, callback, errorCallback);
	};


	/* methods for accessing pipes */

	sh.pipe.request = function (req, callback, errorCallback) {
		var id = req[PIPE_ID];
		if (!id) throw "Invalid " + PIPE_ID;
		var url = servicesConfig.pipes.url + "/" + id + "/permissions";
		return callPOST(url, req, callback, errorCallback);
	};
	sh.pipe.permissions = function (obj, callback, errorCallback) {
		var id = obj.id ? obj.id : obj;
		var url = servicesConfig.pipes.url + "/" + id + "/permissions";
		return callGET(url, callback, errorCallback);
	};
	sh.pipe.permissions.save = function (perms, callback, errorCallback) {
		var url = servicesConfig.pipes.url + "/" + perms[PIPE_ID] + "/permissions";
		return callPUT(url, perms, callback, errorCallback);
	};
	sh.pipe.restrictions = function (obj, callback, errorCallback) {
		var id = obj.id ? obj.id : obj;
		var url = servicesConfig.pipes.url + "/" + id + "/restrictions";
		return callGET(url, callback, errorCallback);
	};
	sh.pipe.restrictions.save = function (restr, callback, errorCallback) {
		var url = servicesConfig.pipes.url + "/" + restr[PIPE_ID] + "/restrictions";
		return callPUT(url, restr, callback, errorCallback);
	};
	sh.pipe.apply = function (req, callback, errorCallback) {
		var id = req[PIPE_ID];
		if (!id) throw "Invalid " + PIPE_ID;
		var url = servicesConfig.pipes.url + "/" + id + "/apply";
		return callPOST(url, req, callback, errorCallback);
	};


	/* methods for access permissions */

	sh.access = sh.access || {};
	sh.access.enable = function (access, callback, errorCallback) {
		var id = access.id ? access.id : access;
		var url = servicesConfig.access.url + "/" + id + "/enable";
		return callPOST(url, {}, callback, errorCallback);
	};
	sh.access.disable = function (access, callback, errorCallback) {
		var id = access.id ? access.id : access;
		var url = servicesConfig.access.url + "/" + id + "/disable";
		return callPOST(url, {}, callback, errorCallback);
	};
	sh.consent = sh.consent || {};
	sh.consent.enable = function (consent, callback, errorCallback) {
		var id = consent.id ? consent.id : consent;
		var url = servicesConfig.consents.url + "/" + id + "/enable";
		return callPOST(url, {}, callback, errorCallback);
	};
	sh.consent.disable = function (consent, callback, errorCallback) {
		var id = consent.id ? consent.id : consent;
		var url = servicesConfig.consents.url + "/" + id + "/disable";
		return callPOST(url, {}, callback, errorCallback);
	};

	/* methods for invitations/memberships of organizations */

	sh.organization.invite = sh.organization.invite || {};
	sh.organization.invite.accept = function (invite, callback, errorCallback) {
		updateOrganizationMembership(STATUS_CONFIRMED, invite, callback, errorCallback);
	};
	sh.organization.invite.reject = function (invite, callback, errorCallback) {
		updateOrganizationMembership(STATUS_REJECTED, invite, callback, errorCallback);
	};

	var updateOrganizationMembership = function (status, invite, callback, errorCallback) {
		var memId = invite[ID] ? invite[ID] : invite;
		var nextCall = {
			headers: callback.headers,
			callback: function (mem) {
				mem[STATUS] = status;
				sh.save.organization.membership(mem, callback, errorCallback);
			}
		}
		sh.organization.membership(memId, nextCall, errorCallback);
	}

	/* methods for simulation control */

	sh.sim = {};
	sh.sim.gen = function (request, callback, errorCallback) {
		var type = request.type == "GPS" ? "traffic" : "curve";
		var url = servicesConfig.simulations.url + "/gen/" + type;
		return callPOST(url, request, callback, errorCallback);
	}

	/* UTILITY METHODS */

	function wrapDefaultErrorCallback(errorCallback) {
		return function (p1, p2, p3, p4, p5) {
			if (typeof errorCallback == "function") {
				var goOn = errorCallback(p1, p2, p3, p4, p5);
				if (goOn === false)
					return;
			}
			if (typeof sh.defaultErrorCallback == "function") {
				sh.defaultErrorCallback(p1, p2, p3, p4, p5);
			}
		}
	}

	var callGET = sh.callGET = function (url, options, errorCallback) {
		var m = mem();
		if (!options)
			options = {};

		var callback = options.callback ? options.callback : options;
		if (options.doCacheResults && m[url]) {
			if (typeof callback == "function") {
				setTimeout(function () {
					callback(m[url]);
				}, 0);
			}
			return m[url];
		}
		var entry = m[url] = {};
		if (ttl > 0) {
			setTimeout(function () {
				delete m[url];
			}, ttl);
		}
		errorCallback = wrapDefaultErrorCallback(errorCallback);
		invokeGET(options, url,
				function (data, status, headers, config) {
					if (!data) {
						callback(data, status, headers, config);
						return;
					}
					if (typeof data.__result != "undefined") data = data.__result;
					if (Array.isArray(data)) {
						m[url] = data;
					} else if (typeof data == "object") {
						if (typeof $ != "undefined") {
							$.extend(entry, data);
						}
					} else {
						m[url] = data;
					}
					if (typeof callback == "function") {
						callback(data, status, headers, config);
					}
				}, errorCallback
		);
		return entry;
	};

	var callPOSTorPUT = function (invokeFunc, url, body, options, errorCallback) {
		if (typeof body == "object") {
			body = JSON.stringify(body);
		}
		if (!options)
			options = {};
		var callback = options.callback ? options.callback : options;
		errorCallback = wrapDefaultErrorCallback(errorCallback);
		invokeFunc(options, url, body,
				function (data, status, headers, config) {
					if (typeof callback == "function") {
						if (typeof data.__result != "undefined") data = data.__result;
						callback(data, status, headers, config);
					}
				}, errorCallback
		);
	};
	var callPOST = sh.callPOST = function (url, body, callback, errorCallback) {
		return callPOSTorPUT(invokePOST, url, body, callback, errorCallback);
	};
	var callPUT = sh.callPUT = function (url, body, callback, errorCallback) {
		return callPOSTorPUT(invokePUT, url, body, callback, errorCallback);
	};

	var callDELETE = sh.callDELETE = function (url, options, errorCallback) {
		var callback = options.callback ? options.callback : options;
		errorCallback = wrapDefaultErrorCallback(errorCallback);
		return invokeDELETE(options, url,
				function (data, status, headers, config) {
					if (typeof callback == "function") {
						callback(data, status, headers, config);
					}
				}, errorCallback
		);
	};

	/* "shared memory", used as entity cache */

	var mem = sh.mem = function () {
		var gl = typeof window == "undefined" ? global : window;
		if (gl.rootScope) {
			if (!gl.rootScope.shared) {
				gl.rootScope.shared = {};
			}
			return gl.rootScope;
		}
		if (!gl.sharedMem) {
			gl.sharedMem = {};
		}
		return gl.sharedMem;
	};

	/* WEBSOCKET FUNCTIONS */

	var connectWebsocket = sh.connectWebsocket = function (options) {
		var onOpenCallback = options.callback ? options.callback : options;
		var sendTokenInProtocolUpdate = options.sendTokenInProtocolUpdate;
		var wsURL = options.url ? options.url : servicesConfig.websocket.url;
		assertAuth();
		var ws;
		if (openConnectionPerRequest || !sh.websocket || sh.websocket.readyState > 1) {
			var authToken = window.authToken ? window.authToken : sh.authToken;

			if (!sendTokenInProtocolUpdate) {
				this.websocket = ws = new WebSocket(wsURL);
			} else if (authToken.network && authToken.access_token) {
				this.websocket = ws = new WebSocket(wsURL,
						authToken.network + "~" + authToken.access_token);
			} else if (authToken.userId && authToken.appKey) {
				this.websocket = ws = new WebSocket(wsURL,
						authToken.userId + "~" + authToken.appKey);
			} else {
				throw "Please provide RIOX_USER_ID and RIOX_APP_KEY variables.";
			}
		}

		if (typeof onOpenCallback == "function") {
			if (ws.readyState == 0) {
				ws.onopen = function () {
					onOpenCallback(ws);
				};
			} else {
				onOpenCallback(ws);
			}
		}

		return ws;
	};

	/* subscribe via websocket */
	sh.subscribe = function (options, callback) {
		var ws = connectWebsocket(function (ws) {
			var msg = {
				type: "SUBSCRIBE",
				thingId: options.thingId,
				propertyName: options.propertyName
			};
			if (options.clientId) {
				msg.clientId = options.clientId;
			}
			ws.send(JSON.stringify(msg));
		});
		ws.onmessage = function (msg) {
			var data = JSON.parse(msg.data);
			if (callback) {
				var result = callback(data);
				if (result === false) {
					// unsubscribe
					var msg = {
						type: "UNSUBSCRIBE",
						thingId: options.thingId,
						propertyName: options.propertyName
					};
					ws.send(JSON.stringify(msg));
				}
			}
		}
	};

	/* unsubscribe all via websocket */

	sh.unsubscribeAll = function (callback) {
		connectWebsocket(function (ws) {
			var msg = {
				type: "UNSUBSCRIBE",
				unsubscribeAll: true
			};
			ws.send(JSON.stringify(msg));
			if (callback) {
				callback(ws);
			}
		});
	};

	/* HELPER METHODS */

	var assertID = function (obj) {
		var id = obj.id || obj._id;
		if (!id)
			throw new Error("Unexpected 'id' property: " + obj);

		return id;
	};

	/* http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript */
	var guid = (function () {
		function s4() {
			return Math.floor((1 + Math.random()) * 0x10000)
					.toString(16)
					.substring(1);
		}

		return function () {
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
					s4() + '-' + s4() + s4() + s4();
		};
	})();

	var clone = function (obj) {
		return JSON.parse(JSON.stringify(obj));
	};

	/* expose API */

	if (typeof module != "undefined") {
		module.exports = sh;
	} else if (typeof window != "undefined") {
		window.riox = sh;

		/* INIT METHODS (must go last) */
		if (window.RIOX_USER_ID && window.RIOX_APP_KEY) {
			sh.auth();
		}
		;
	}


	return sh;
})();

//@formatter:off
/*
A JavaScript implementation of the SHA family of hashes, as
defined in FIPS PUB 180-2 as well as the corresponding HMAC implementation
as defined in FIPS PUB 198a
Copyright Brian Turek 2008-2015
Distributed under the BSD License
See http://caligatio.github.com/jsSHA/ for more information
Several functions taken from Paul Johnston
*/
