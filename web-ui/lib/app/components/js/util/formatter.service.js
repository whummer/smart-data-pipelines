'use strict';

angular.module('rioxApp')
.factory('Formatter', function () {

    var app = {
    	pricing: function(thePrice) {
    		if(!thePrice) return "";
    		var str = "";
    		if(thePrice.billingUnit == "event" || thePrice.billingUnit == "day") {
    			str += thePrice.unitPrice + " € ";
    			str += thePrice.billingUnit == "event" ? "per data point" : "per day";
    			return str;
    		}
    		if(thePrice.billingUnit == "free") {
    			return "free of charge";
    		}
    		if(thePrice.billingUnit == "on_request") {
    			return "request price";
    		}
    		return "n/a";
    	}
    };

    return app;
});
