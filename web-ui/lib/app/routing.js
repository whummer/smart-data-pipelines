'use strict';

angular.module('rioxApp').config(function ($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise("/main");

	var states = {

		/* main index */
		'index': {
			templateUrl: "app/views/layout/content.html"
		},
		'index.main': {
			url: "/main",
			templateUrl: "app/views/main/main.html"
		},

		/* dashboard */
		'index.dashboard': {
			url: '/dashboard',
			templateUrl: 'app/views/dashboard/dashboard.html',
			controller: 'DashboardCtrl',
			authenticate: true
		},

		/* settings */
		'index.settings': {
			url: '/settings',
			templateUrl: 'app/views/settings/settings.html',
			controller: 'SettingsCtrl',
			data: {
				/* this flag in this 'data' bag is propagated to all child-states */
				authenticate: true
			}
		},
		'index.settings.account': {
			url: '/account',
			templateUrl: 'app/views/settings/account.html',
			controller: 'SettingsAccountCtrl'
		},
		'index.settings.organizations': {
			url: '/organizations',
			templateUrl: 'app/views/settings/organizations.html',
			controller: 'OrganizationsController'
		},
		'index.settings.security': {
			url: '/security',
			templateUrl: 'app/views/settings/security.html',
			controller: 'SettingsSecurityCtrl'
		},
		'index.settings.billing': {
			url: '/billing',
			templateUrl: 'app/views/settings/billing.html',
			controller: 'SettingsBillingCtrl'
		},

		/* authentication */
		'index.login': {
			url: '/login',
			templateUrl: 'app/views/account/login/login.html',
			controller: 'LoginCtrl'
		},
		'index.signup': {
			url: '/signup',
			templateUrl: 'app/views/account/signup/signup.html',
			controller: 'SignupCtrl'
		},
		'index.recover': {
			url: '/recover',
			templateUrl: 'app/views/account/login/recover.html',
			controller: 'RecoverCtrl'
		},
		'index.auth.facebook.callback': {
			url: '/auth/facebook/callback',
			templateUrl: 'app/views/account/callback/index.html',
			controller: 'CallbackCtrl'
		},
		'index.activate': {
			url: '/activate/{activationKey}',
			templateUrl: 'app/views/account/signup/activate.html',
			controller: 'SignupCtrl'
		},

		/* general */
		'index.notifications': {
			url: "/notifications",
			templateUrl: "app/views/account/notifications/notifications.html",
			controller: "NotificationsCtrl",
			data: {
				/* this flag in this 'data' bag is propagated to all child-states */
				authenticate: true
			}
		},

		/* invitations mgmt */
		'index.accept': {
			url: "/accept/{membershipId}",
			templateUrl: "app/views/settings/invitation.html",
			controller: "InvitationCtrl",
			authenticate: true
		},
		'index.reject': {
			url: "/reject/{membershipId}",
			templateUrl: "app/views/settings/invitation.html",
			controller: "InvitationCtrl",
			authenticate: true
		},

		/* statistics */
		'index.statistics': {
			url: "/statistics",
			templateUrl: "app/views/statistics/statistics.html",
			controller: "StatsCtrl"
		},

		/* admin */
		'index.admin': {
			url: "/admin",
			templateUrl: "app/views/admin/admin.html",
			controller: "AdminCtrl",
			controllerUrl: "app/views/admin/admin.controller.js"
		},

		/*
		 *
		 * smart data pipeline views
		 *
		 */

		'index.sdps': {
			abstract: true,
			url: "/sdps",
			controller: 'DataPipesCtrl',
			templateUrl: "app/views/sdps/sdps.html",
			data: {
				authenticate: true
			}
		},

		'index.sdps.create': {
			url: '/edit/:pipeId',
			views: {
				"editSdp@index.sdps": {
					templateUrl: 'app/views/sdps/sdps.edit.html',
					controller: 'EditDataPipeCtrl'
				}
			}
		},

		'index.sdps.list': {
			url: '/list',
			views: {
				"listSdp@index.sdps": {
					templateUrl: 'app/views/sdps/sdps.list.html',
					controller: 'ListDataPipesCtrl'
				}
			}
		},

		/** Help section **/
		'index.help': {
			url: '/help',
			templateUrl: 'app/views/help/bricks.list.html',
			controller: 'ListBricksCtrl'
		},
		'index.help.databricks': {
			url: '/databricks',
			templateUrl: 'app/views/help/bricks.list.html',
			controller: 'ListBricksCtrl'
		}

	};

	/* set state routes */
	var tmp = $stateProvider;
	for (var key in states) {
		var s = states[key];
		if (s.controllerUrl) {
			/* lazily load some of the controllers */
			s.resolve = {
				loadMyCtrl: ['$ocLazyLoad', function ($ocLazyLoad) {
					return $ocLazyLoad.load(s.controllerUrl);
				}]
			};
		}
		tmp = tmp.state(key, states[key]);
	}


});
