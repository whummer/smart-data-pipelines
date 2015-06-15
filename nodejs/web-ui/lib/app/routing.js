'use strict';

angular.module('rioxApp')
.config(function ($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise("/main");

	$stateProvider

	/* main index */
		.state('index', {
			templateUrl: "app/views/layout/content.html"
		})
		.state('index.main', {
			url: "/main",
			templateUrl: "app/views/main/main.html"
		})

	// dashboard
		.state('index.dashboard', {
			url: '/dashboard',
			templateUrl: 'app/views/account/dashboard/dashboard.html',
			authenticate: true
		})

	// settings
		.state('index.settings', {
			url: '/settings',
			templateUrl: 'app/views/settings/settings.html',
			controller: 'SettingsCtrl',
			data: {
				/* this flag in this 'data' bag is propagated to all child-states */
				authenticate: true
			}
		})
		.state('index.settings.account', {
			url: '/account',
			templateUrl: 'app/views/settings/account.html',
			controller: 'SettingsAccountCtrl'
		})
		.state('index.settings.organizations', {
			url: '/organizations',
			templateUrl: 'app/views/settings/organizations.html',
			controller: 'OrganizationsController'
		})
		.state('index.settings.security', {
			url: '/security',
			templateUrl: 'app/views/settings/security.html',
			controller: 'SettingsSecurityCtrl'
		})
		.state('index.settings.billing', {
			url: '/billing',
			templateUrl: 'app/views/settings/billing.html',
			controller: 'SettingsBillingCtrl'
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
		.state('index.auth.facebook.callback', {
			url: '/auth/facebook/callback',
			templateUrl: 'app/views/account/callback/index.html',
			controller: 'CallbackCtrl'
		})
		.state('index.activate', {
			url: '/activate/{activationKey}',
			templateUrl: 'app/views/account/signup/activate.html',
			controller: 'SignupCtrl'
		})

	// general
		.state('index.notifications', {
			url: "/notifications",
			templateUrl: "app/views/account/notifications/notifications.html",
			controller: "NotificationsCtrl",
			data: {
				/* this flag in this 'data' bag is propagated to all child-states */
				authenticate: true
			}
		})
		
	// invitations mgmt
		.state('index.accept', {
			url: "/accept/{membershipId}",
			templateUrl: "app/views/settings/invitation.html",
			controller: "InvitationCtrl",
			authenticate: true
		})
		.state('index.reject', {
			url: "/reject/{membershipId}",
			templateUrl: "app/views/settings/invitation.html",
			controller: "InvitationCtrl",
			authenticate: true
		})

	// APIs
		.state('index.apis', {
			abstract: true,
			url: "/apis",
			templateUrl: "app/views/apis/apis.html",
			controller: "ApisCtrl",
			data: {
				/* this flag in this 'data' bag is propagated to all child-states */
				authenticate: true
			}
		})
		.state('index.apis.list', {
			url: "",
			views: {
				"apiList@index.apis": {
					templateUrl: "app/views/apis/apis.list.html",
					controller: "ApisEndpointsCtrl"
				}
			}
		})
		.state('index.apis.list.single', {
			url: "/{sourceId}",
			views: {
				"apiDetails@index.apis": {
					templateUrl: "app/views/apis/apis.single.html",
					controller: "ApisEndpointsSingleCtrl"
				}
			}
		})

	// APIs wizard/setup
		.state('index.apis.wizard', {
			url: "/wizard?debug",
			views: {
				"apiList@index.apis": {
					templateUrl: "app/views/apis/wizard/wizard.html",
					controller: "ApisWizardCtrl"
				}
			}
		})
		.state('index.apis.wizard.basic', {
			url: '/basic',
			templateUrl: 'app/views/apis/wizard/basic.html'
		})
		.state('index.apis.wizard.connector', {
			url: '/connector',
			templateUrl: 'app/views/apis/wizard/data_connector.html'
		})
		.state('index.apis.wizard.security', {
			url: '/security',
			templateUrl: 'app/views/apis/wizard/security.html',
			controller: 'WizardSecurityCtrl'
		})
		.state('index.apis.wizard.data_access', {
			url: '/access',
			templateUrl: 'app/views/apis/wizard/data_access.html'
		})
//		.state('index.apis.wizard.data_pricing', {
//			url: '/pricing',
//			templateUrl: 'app/views/apis/wizard/data_pricing.html'
//		})
		.state('index.apis.wizard.data_items', {
			url: '/items',
			templateUrl: 'app/views/apis/wizard/data_items.html',
			controller: 'WizardItemsCtrl'
		})
		.state('index.apis.wizard.deployment', {
			url: '/deployment',
			templateUrl: 'app/views/apis/wizard/deployment.html'
		})

	// access control
		.state('index.apis.access', {
			url: "/{sourceId}/access",
			views: {
				"apiDetails@index.apis": {
					templateUrl: "app/views/access/access.html",
					controller: "AccessCtrl"
				}
			}
		})

	// operations
		.state('index.apis.operations', {
			url: "/{sourceId}/operations",
			views: {
				"apiDetails@index.apis": {
					templateUrl: "app/views/operations/operations.html",
					controller: "OperationsCtrl"
				}
			}
		})
		.state('index.apis.operations.single', {
			url: "/{operationId}",
			templateUrl: "app/views/operations/operations.single.html",
			controller: "OperationsSingleCtrl"
		})

	// schemas
		.state('index.apis.schemas', {
			url: "/{sourceId}/schemas",
			views: {
				"apiDetails@index.apis": {
					templateUrl: "app/views/schemas/schemas.html",
					controller: "SchemasCtrl"
				}
			}
		})
		.state('index.apis.schemas.single', {
			url: "/{schemaId}",
			templateUrl: "app/views/schemas/schemas.single.html",
			controller: "SchemasSingleCtrl"
		})

	// pricing
		.state('index.apis.pricing', {
			url: "/{sourceId}/pricing",
			views: {
				"apiDetails@index.apis": {
					templateUrl: "app/views/pricing/pricing.html",
					controller: "PricingCtrl"
				}
			}
		});

	// streams
//		.state('streams', {
//			abstract: true,
//			templateUrl: "app/views/common/content.html",
//			url: "/streams",
//			controller: "StreamsCtrl",
//			data: {
//				/* this flag in this 'data' bag is propagated to all child-states */
//				authenticate: true
//			}
//		})
//		.state('streams.provided', {
//			url: "/provided",
//			templateUrl: "app/views/streams/streams.provided.html",
//			controller: "StreamsProvidedCtrl"
//		})
//		.state('streams.provided.single', {
//			url: "/{sourceId}/{organizationId}",
//			templateUrl: "app/views/streams/streams.provided.single.html",
//			controller: "StreamsProvidedSingleCtrl"
//		})
//		.state('streams.consumed', {
//			url: "/consumed/{sourceId}",
//			templateUrl: "app/views/streams/streams.consumed.html",
//			controller: "StreamsConsumedCtrl"
//		})
	// provider wizard/setup
//		.state('provider', {
//			abstract: true,
//			templateUrl: "app/views/common/content.html",
//			url: "/providers",
//			data: {
//				/* this flag in this 'data' bag is propagated to all child-states */
//				authenticate: true
//			}
//		})
//		.state('provider.wizard', {
//			url: "/wizard?debug",
//			templateUrl: "app/views/provider_wizard/provider_setup.html",
//			controller: providerWizardCtrl
//		})
//		.state('provider.wizard.semantics', {
//			url: '/semantics',
//			templateUrl: 'app/views/provider_wizard/data_semantics.html',
//			data: {pageTitle: 'Describe your data'}
//		})
//		.state('provider.wizard.connector_setup', {
//			url: '/connector-setup',
//			templateUrl: 'app/views/provider_wizard/data_connector.html',
//			data: {pageTitle: 'Setup provider technology'}
//		})
//		.state('provider.wizard.data_retention', {
//			url: '/data-retention',
//			templateUrl: 'app/views/provider_wizard/data_retention.html',
//			data: {pageTitle: 'Setup data retention'}
//		})
//		.state('provider.wizard.data_access', {
//			url: '/data-access',
//			templateUrl: 'app/views/provider_wizard/data_access.html',
//			data: {pageTitle: 'Setup data access &amp; authorization'}
//		})
//		.state('provider.wizard.data_pricing', {
//			url: '/data-pricing',
//			templateUrl: 'app/views/provider_wizard/data_pricing.html',
//			data: {pageTitle: 'Setup data pricing'}
//		})
//		.state('provider.wizard.data_items', {
//			url: '/data-items',
//			templateUrl: 'app/views/provider_wizard/data_items.html',
//			data: {pageTitle: 'Extract data items'}
//		})
//		.state('provider.wizard.analytics', {
//			url: '/analytics',
//			templateUrl: 'app/views/provider_wizard/analytics.html',
//			data: {pageTitle: 'Setup analytics'}
//		})
//		.state('provider.wizard.deployment', {
//			url: '/deployment',
//			templateUrl: 'app/views/provider_wizard/deployment.html',
//			data: {pageTitle: 'Setup connector deployment'}
//		})

	// consumer wizard setup
//		.state('consumer', {
//			abstract: true,
//			templateUrl: "app/views/common/content.html",
//			url: "/consumers",
//			controller: "StreamsCtrl"
//		})
//		.state('consumer.wizard', {
//			url: "/wizard?debug",
//			templateUrl: "app/views/consumer_wizard/consumer_setup.html",
//			controller: consumerWizardCtrl
//		})
//		.state('consumer.wizard.catalog', {
//			url: '/catalog',
//			templateUrl: 'app/views/consumer_wizard/catalog.html',
//			controller: "StreamsCatalogCtrl"
//		})
//		.state('consumer.wizard.request', {
//			url: '/request/{sourceId}',
//			templateUrl: 'app/views/consumer_wizard/request.html',
//			controller: 'ConsumerRequestCtrl',
//			authenticate: true
//		})
//		.state('consumer.wizard.billing', {
//			url: '/billing',
//			templateUrl: 'app/views/consumer_wizard/billing.html',
//			authenticate: true
//		})
//		.state('consumer.wizard.analytics', {
//			url: '/analytics',
//			templateUrl: 'app/views/consumer_wizard/analytics.html',
//			authenticate: true
//		})
//		.state('consumer.wizard.connector', {
//			url: '/connector',
//			templateUrl: 'app/views/consumer_wizard/connector.html',
//			controller: 'ConsumerConnectorCtrl',
//			authenticate: true
//		})
//		.state('consumer.wizard.confirm', {
//			url: '/confirm',
//			templateUrl: 'app/views/consumer_wizard/confirm.html',
//			controller: 'ConsumerConfirmCtrl',
//			authenticate: true
//		})

});
