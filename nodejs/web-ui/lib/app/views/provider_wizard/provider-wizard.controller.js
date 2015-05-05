function providerWizardCtrl($scope, $log, growl, $state, $location, $q) {
  $scope.resourceData = {
    connector: {name: "HTTP Connector", type: "http"}
  };

  $scope.retentionEnabled = false;
  $scope.retentionDisabled = false;

  /*$scope.securityEnabled = false;
   $scope.securityDisabled = false;*/

  if ($state.params.debug) {
    $scope.debug = true;
  }

  $scope.connectors = [
    {name: "HTTP Connector", type: "http"},
    {name: "AMQP Connector", type: "amqp"},
    {name: "JMS Connector", type: "jms"},
    {name: "MQTT Connector", type: "mqtt"},
    {name: "SMTP Connector", type: "smtp"},
    {name: "TCP Connector", type: "tcp"}
  ];

  $scope.retentionTimeSliderOptions = {
    values: [
      "1 Hour", "24 Hours", "3 Days",
      "1 Week", "2 Weeks", "1 Month",
      "3 Months", "6 Months", "1 Year"
    ],
    type: 'single',
    hasGrid: true,
    onChange: updateRetentionTime
  };

  function updateRetentionTime(slider) {
    var retentionTimes = [
      "1h", "24h", "3d", "1w", "2w", "1m", "3m", "6m", "1y"
    ];

    var value = slider.from;
    $scope.resourceData.retentionTime = retentionTimes[value];
    $log.debug("Changed retention time to ", $scope.resourceData.retentionTime);
  }

  function updateSecuritySettings(slider) {
    var securitySettings = ["tls_in", "tls_in_out", "3des_full", "rsa_2048_full"];
    var value = slider.from;
    $scope.resourceData.securitySetting = securitySettings[value];
    $log.debug("Changed security settings to ", $scope.resourceData.securitySetting);

  }

  $scope.securitySliderOptions = {
    values: [
      "Inbound TLS", "Inbound & Outbound TLS", " Encryption: 3DES",
      "Encryption: RSA-2048"
    ],
    type: 'single',
    hasGrid: true,
    onChange: updateSecuritySettings
  };

  $scope.processForm = function () {
    var r = $scope.resourceData;

    // todo find out wht the filter does not work
    //var dataItems = $filter('filter')(r.dataItems, {"enabled" : "true"});

    var dataItems = [];
    angular.forEach(r.dataItems, function (dataItem) {
      if (dataItem.enabled) {
        dataItems.push({name: dataItem.name, price: dataItem.price});
      }
    });

    $log.debug("Filtered data items: ", dataItems);
    $log.debug("Saving new resource: ", r);
    var dataStream = {
      "name": r.name,
      "description": r.description,
      "connector": {
        "type": r.connector.type // http, amqp, whatever
      },
      "organization-id": 'Default Organization',
      "tags": r.tags,
      "retention-time": r.retentionTime, // e.g. 3h, 2w, 1m, 1y
      "security": r.securitySetting, // TLS only, full
      "visible": true
    };

    // todo billingUnit and unitSize are currently not used
    if (dataItems.length) {
      dataStream["data-items"] = dataItems;
    } else {
      dataStream.pricing = {
        unitPrice: r.defaultPricing
      };
    }

    var addStreamSource = function (defaultOrganization) {
      $log.debug('Loaded default organization: ', defaultOrganization);
      dataStream['organization-id'] = defaultOrganization.id;
      riox.add.streams.source(dataStream, function () {
        $log.debug("Successfully added new data resource: ", dataStream);
        growl.success("Added new Data Resource '" + dataStream.name + "'");
        $location.path("#/streams/provided");
      })
    };

    var organizationPromise = $scope.loadDefaultOrganization();
    organizationPromise.then(addStreamSource,
      function (reason) {
        growl.error('Cannot load default organization: ' + reason);
        $log.error('Cannot load default orgaization: ' + reason);
      });
  }

}

angular.module('rioxApp').controller(providerWizardCtrl);
