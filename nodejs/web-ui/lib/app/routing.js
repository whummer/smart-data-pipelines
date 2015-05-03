'use strict';

angular.module('rioxApp')
.config(function ($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise("/index/main");

	$stateProvider

	/* main index */
		.state('index', {
			url: "/index",
			templateUrl: "app/views/common/content.html"
		})
		.state('index.main', {
			url: "/main",
			templateUrl: "app/views/main/main.html"
		})

	// settings and dashboard states
		.state('index.dashboard', {
			url: '/dashboard',
			templateUrl: 'app/views/account/dashboard/dashboard.html',
			data: {pageTitle: 'riox.io - dashboard'}
		})
		.state('index.settings', {
			url: '/settings',
			templateUrl: 'app/views/account/settings/settings.html',
			controller: 'SettingsCtrl',
			data: {pageTitle: 'riox.io - settings'},
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
			controller: providerWizardCtrl
		})
		.state('provider.wizard.semantics', {
			url: '/semantics',
			templateUrl: 'app/views/provider_wizard/data_semantics.html',
			data: {pageTitle: 'Describe your data'}
		})
		.state('provider.wizard.connector_setup', {
			url: '/connector-setup',
			templateUrl: 'app/views/provider_wizard/data_connector.html',
			data: {pageTitle: 'Setup provider technology'}
		})
		.state('provider.wizard.data_retention', {
			url: '/data-retention',
			templateUrl: 'app/views/provider_wizard/data_retention.html',
			data: {pageTitle: 'Setup data retention'}
		})
		.state('provider.wizard.data_access', {
			url: '/data-access',
			templateUrl: 'app/views/provider_wizard/data_access.html',
			data: {pageTitle: 'Setup data access &amp; authorization'}
		})
		.state('provider.wizard.data_pricing', {
			url: '/data-pricing',
			templateUrl: 'app/views/provider_wizard/data_pricing.html',
			data: {pageTitle: 'Setup data pricing'}
		})
		.state('provider.wizard.data_items', {
			url: '/data-items',
			templateUrl: 'app/views/provider_wizard/data_items.html',
			data: {pageTitle: 'Extract data items'}
		})
		.state('provider.wizard.analytics', {
			url: '/analytics',
			templateUrl: 'app/views/provider_wizard/analytics.html',
			data: {pageTitle: 'Setup analytics'}
		})
		.state('provider.wizard.deployment', {
			url: '/deployment',
			templateUrl: 'app/views/provider_wizard/deployment.html',
			data: {pageTitle: 'Setup connector deployment'}
		})

	// consumer wizard setup
		.state('consumer', {
			abstract: true,
			templateUrl: "app/views/common/content.html",
			url: "/consumers",
			controller: "StreamsCtrl"
		})
		.state('consumer.wizard', {
			url: "/wizard",
			templateUrl: "app/views/consumer_wizard/consumer_setup.html",
			controller: consumerWizardCtrl
		})
		.state('consumer.wizard.catalog', {
			url: '/catalog',
			templateUrl: 'app/views/consumer_wizard/catalog.html'
		})
		.state('consumer.wizard.request', {
			url: '/request/{sourceId}',
			templateUrl: 'app/views/consumer_wizard/request.html',
			controller: 'ConsumerRequestCtrl'
		})
		.state('consumer.wizard.billing', {
			url: '/billing',
			templateUrl: 'app/views/consumer_wizard/billing.html'
		})
		.state('consumer.wizard.confirm', {
			url: '/confirm',
			templateUrl: 'app/views/consumer_wizard/confirm.html'
		})

	// general
		.state('index.notifications', {
			url: "/notifications",
			templateUrl: "app/views/account/notifications/notifications.html",
			controller: "NotificationsCtrl"
		})

	// streams
		.state('streams', {
			abstract: true,
			templateUrl: "app/views/common/content.html",
			url: "/streams",
			controller: "StreamsCtrl"
		})
		.state('streams.provided', {
			url: "/provided/{streamId}",
			templateUrl: "app/views/streams/streams.provided.html",
			controller: "StreamsProvidedCtrl"
		})
		.state('streams.consumed', {
			url: "/consumed/{streamId}",
			templateUrl: "app/views/streams/streams.consumed.html",
			controller: "StreamsConsumedCtrl"
		});

});