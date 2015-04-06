function config(growlProvider, $stateProvider, $urlRouterProvider) {
    growlProvider.globalTimeToLive(3000);

    $urlRouterProvider.otherwise("/index/main");

    $stateProvider

        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html"
        })
        .state('index.main', {
            url: "/main",
            templateUrl: "views/main.html",
            data: { pageTitle: 'Example view' }
        })

        // settings and dashboard states
        .state('index.dashboard', {
            url: '/dashboard',
            templateUrl: 'views/dashboard.html',
            data: { pageTitle: 'riox.io - dashboard' }
        })
        .state('index.settings', {
            url: '/settings',
            templateUrl: 'views/settings.html',
            data: { pageTitle: 'riox.io - settings' }
        })

        // provider wizard setup

        .state('provider', {
            abstract: true,
            templateUrl: "views/common/content.html",
            url: "/providers"
        })

        .state('provider.wizard', {
            url: "/wizard?debug",
            templateUrl: "views/provider_setup.html",
            controller: providerWizardCtrl,
            data: { pageTitle: 'Wizard form' }
        })

        .state('provider.wizard.semantics', {
            url: '/semantics',
            templateUrl: 'views/provider_wizard/data_semantics.html',
            data: { pageTitle: 'Describe your data' }
        })
        .state('provider.wizard.connector_setup', {
            url: '/connector-setup',
            templateUrl: 'views/provider_wizard/connector_setup.html',
            data: { pageTitle: 'Setup provider technology' }
        })
        .state('provider.wizard.data_retention', {
            url: '/data-retention',
            templateUrl: 'views/provider_wizard/data_retention.html',
            data: { pageTitle: 'Setup data retention' }
        })
        .state('provider.wizard.analytics', {
            url: '/analytics',
            templateUrl: 'views/provider_wizard/analytics.html',
            data: { pageTitle: 'Setup analytics' }
        })
        .state('provider.wizard.deployment', {
            url: '/deployment',
            templateUrl: 'views/provider_wizard/deployment.html',
            data: { pageTitle: 'Setup connector deployment' }
        })

        // consumer wizard setup
        
        .state('consumer', {
            abstract: true,
            templateUrl: "views/common/content.html",
            url: "/consumers"
        })

        .state('consumer.wizard', {
            url: "/wizard",
            templateUrl: "views/consumer_setup.html",
            controller: consumerWizardCtrl,
            data: { pageTitle: 'Wizard form' }
        })

        .state('consumer.wizard.catalog', {
            url: '/step_one',
            templateUrl: 'views/consumer_wizard/catalog.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.request', {
            url: '/step_one',
            templateUrl: 'views/consumer_wizard/request.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.billing', {
            url: '/step_one',
            templateUrl: 'views/consumer_wizard/billing.html',
            data: { pageTitle: 'Wizard form' }
        })
        .state('consumer.wizard.confirm', {
            url: '/step_one',
            templateUrl: 'views/consumer_wizard/confirm.html',
            data: { pageTitle: 'Wizard form' }
        });
}

angular
    .module('riox')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
