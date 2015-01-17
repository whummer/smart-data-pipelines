require(['jquery', 'jquery-ui', 'angular', 'moment'],
	function(jquery, jqueryUI) {

		/* whu: dirty hack: we need to unset window.define in order
		 * to successfully include bootstrap-datetimepicker. */
		var oldDefine = window.define;
		window.define = undefined;

		require(['bootstrap-datetimepicker'],
			function(tp) {

				/* whu: dirty hack: don't forget to reset window.define
				 * after loading bootstrap-datetimepicker. */
				window.define = oldDefine;
	
				require(
					[	
						'app', 
						'riots/auth', 'riots/service-calls', 'riots/utils', 
						'riots/widgets-angularui', 'riots/maps-markers',
						'riots/ratings', 'riots/charting'
					],
					function(app) {
						try {
							window.angular.bootstrap(document, ['app']);
					    } catch(e) {
					    	console.log("Error when initializing the application. Please re-load the page.", e);
					    }
					}
				);
			}
		);
	}
);