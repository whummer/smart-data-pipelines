/**
 * Defines metadata about the available analytics functions.
 * This is currently defined statically. We expect to do this dynamically
 * by either allowing an "admin" area where this can be defined.
 */



var AnalyticsFunction = require("../api/analytics/analytics.model");

var data = [
  {
    name: "moving_average",
    description: "Calculated the moving average over a list of N items",
    "input-type": "application/x-xd-tuple",
    input: [
      {
        key: "itemPath",
        "value-type": "String",
        description: "The path to the data item for calculating the moving average (e.g., cardata.fuel-level)",
      },
      {
        key: "items",
        description: "The number of items considered for the average calculation",
        "value-type": "Number"
      }
    ],
    output: [{
      key: "riox-analytics.moving_average",
      "value-type": "Number"
    }]
  },

  {
    name: "geo_fence_circular",
    description: "",
    "input-type": "application/x-xd-tuple",

    "input": [
      {
        key: "latitude",
        description: "The geo-fence center latitude",
        "value-type": "Number"
      },
      {
        key: "longitude",
        description: "The geo-fence center longitude",
        "value-type": "Number"
      },
      {
        key: "radius",
        description: "The radius for the geo-fence (in meters)",
        "value-type": "Number"
      },
      {
        key: "latPath",
        description: "The path to the latitude data item",
        "value-type": "String"
      },
      {
        key: "longPath",
        description: "The path to the longitude data item",
        "value-type": "String"
      }],
    output: [{
      path: "riox-analytics.inside_geofence",
      "value-type": "Boolean"
    }]
  }
]


AnalyticsFunction.find({}, function (err, list) {
  if (err) {
    console.error(err);
    return;
  }
  if (!list || !list.length) {
    data.forEach(function (el) {
      var o = new AnalyticsFunction(el);
      o.save();
    });
  }
});

