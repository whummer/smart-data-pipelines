'use strict';

angular.module('rioxApp')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise("/index/main");

    $stateProvider
        .state('index', {
            url: "/index",
            templateUrl: "app/views/common/content.html"
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "app/views/main/main.html",
            data: { pageTitle: 'Example view' }
        })

        // settings and dashboard states
        .state('index.dashboard', {
            url: '/dashboard',
            templateUrl: 'app/views/account/dashboard/dashboard.html',
            data: { pageTitle: 'riox.io - dashboard' }
        })
        .state('index.settings', {
          url: '/settings',
          templateUrl: 'app/views/account/settings/settings.html',
          controller: 'SettingsCtrl',
          data: { pageTitle: 'riox.io - settings' },
          authenticate: true
        })

        // authentication,
        .state('index.login', {
          url: '/login',
          templateUrl: 'app/views/account/login/login.html',
          controller: 'LoginCtrl'
        })
        .state('index.signup', {
          url: '/signup',
          templateUrl: 'app/views/account/signup/signup.html',
          controller: 'SignupCtrl'
        })


        // provider wizard/setup
        .state('provider', {
            abstract: true,
            templateUrl: "app/views/common/content.html",
            url: "/providers"
        })
        .state('provider.wizard', {
            url: "/wizard?debug",
            templateUrl: "app/views/provider_wizard/provider_setup.html",
            controller: providerWizardCtrl,
            data: { pageTitle: 'Wizard form' }
        })
        .state('provider.wizard.semantics', {
            url: '/semantics',
            templateUrl: 'app/views/provider_wizard/data_semantics.html',
            data: { pageTitle: 'Describe your data' }
        })
        .state('provider.wizard.connector_setup', {
            url: '/connector-setup',
            templateUrl: 'app/views/provider_wizard/connector_setup.html',
            data: { pageTitle: 'Setup provider technology' }
        })
        .state('provider.wizard.data_retention', {
            url: '/data-retention',
            templateUrl: 'app/views/provider_wizard/data_retention.html',
            data: { pageTitle: 'Setup data retention' }
        })
        .state('provider.wizard.analytics', {
            url: '/analytics',
            templateUrl: 'app/views/provider_wizard/analytics.html',
            data: { pageTitle: 'Setup analytics' }
        })
        .state('provider.wizard.deployment', {
            url: '/deployment',
            templateUrl: 'app/views/provider_wizard/deployment.html',
            data: { pageTitle: 'Setup connector deployment' }
        })

        // consumer wizard setup
        .state('consumer', {
            abstract: true,
            templateUrl: "app/views/common/content.html",
            url: "/consumers"
        })
        .state('consumer.wizard', {
            url: "/wizard",
            templateUrl: "app/views/consumer_wizard/consumer_setup.html",
            controller: consumerWizardCtrl,
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.catalog', {
            url: '/catalog',
            templateUrl: 'app/views/consumer_wizard/catalog.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.request', {
            url: '/request',
            templateUrl: 'app/views/consumer_wizard/request.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.billing', {
            url: '/billing',
            templateUrl: 'app/views/consumer_wizard/billing.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.confirm', {
            url: '/confirm',
            templateUrl: 'app/views/consumer_wizard/confirm.html',
            data: { pageTitle: 'Wizard form' }
        });

  });