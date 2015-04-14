'use strict';

var DataStream = require('./datastream.model');
var passport = require('passport');
var jwt = require('jsonwebtoken');

// TODO remove
var LOREM = " Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum";
var demoData = [
	{
		id: 1, name: "Traffic Lights", description: "This data stream contains live " +
	"updates of traffic lights." + LOREM,
		organizationImg: "assets/img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
		price: {type: "per_day", amount: 123.4}, permit: {type: "auto"}
	},
	{
		id: 2, name: "Car Data", description: "This data stream contains live vehicle data, " +
	"including location, fuel level." + LOREM,
		organizationImg: "assets/img/provider-logos/bmw.png", organizationName: "BMW",
		price: {type: "per_event", amount: 0.0012}, permit: {type: "manual"}
	},
	{
		id: 3, name: "Temperature Values", description: "Live temperature updates of various locations in " +
	"Vienna, Austria." + LOREM,
		organizationImg: "assets/img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
		price: {type: "free"}, permit: {type: "auto"}
	},
	{
		id: 4, name: "Incidents", description: "This data stream contains live incidents " +
	"for the City of Vienna." + LOREM,
		organizationImg: "assets/img/provider-logos/smart_city_wien.png", organizationName: "City of Vienna",
		price: {type: "free"}, permit: {type: "auto"}
	},
	{
		id: 5, name: "Car Data", description: "This data stream contains live vehicle data, " +
	"including location, fuel level." + LOREM,
		organizationImg: "assets/img/provider-logos/tesla.png", organizationName: "TESLA",
		price: {type: "per_event", amount: 0.0025}, permit: {type: "auto"}
	},
	{
		id: 6, name: "Car Data", description: "This data stream contains live vehicle data, " +
	"including location, fuel level." + LOREM,
		organizationImg: "assets/img/provider-logos/mercedes.gif", organizationName: "Mercedes",
		price: {type: "per_event", amount: 0.0018}, permit: {type: "auto"}
	},
	{
		id: 7, name: "Car Data", description: "This data stream contains live vehicle data, " +
	"including location, fuel level." + LOREM,
		organizationImg: "assets/img/provider-logos/toyota.png", organizationName: "Toyota",
		price: {type: "per_event", amount: 0.0018}, permit: {type: "auto"}
	},
	{
		id: 8, name: "Smart Building Data", description: "This data stream contains " +
	"live about smart buildings." + LOREM,
		organizationImg: "assets/img/provider-logos/energieeffizienz.jpg", organizationName: "Energieeffizienz",
		price: {type: "on_request", amount: 0.0018}, permit: {type: "auto"}
	}
];

var validationError = function(res, err) {
	return res.json(422, err);
};

exports.index = function(req, res) {
  DataStream.find({}, function (err, list) {
	  if(!list || !list.length) {
		  list = demoData;
	  }
	  if(err) return res.send(500, err);
	  res.json(200, list);
  });
};

exports.create = function (req, res, next) {
	var newObj = new DataStream(req.body);
	newObj.save(function(err, obj) {
		if (err) return validationError(res, err);
		res.json(obj);
	});
};

exports.show = function (req, res, next) {
	var id = req.params.id;

	DataStream.findById(id, function (err, obj) {
		if (err) return next(err);
		if (!obj) return res.send(401);
		res.json(obj);
	});
};

exports.destroy = function(req, res) {
	DataStream.findByIdAndRemove(req.params.id, function(err, obj) {
		if(err) return res.send(500, err);
		return res.send(204);
	});
};
