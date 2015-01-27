require(['jquery', 'jquery-ui', 'angular', 'moment'],
		function (jquery, jqueryUI) {
			require(
					[
						'app',
						'riots/auth', 'riots/service-calls', 'riots/utils',
						'riots/widgets-angularui', 'riots/maps-markers',
						'riots/ratings', 'riots/charting'
					],
					function (app) {
						try {
							angular.bootstrap(document, ['app']);
						} catch (e) {
							console.log("Error when initializing the application. Please re-load the page.", e);
						}
					}
			);
		}
);
