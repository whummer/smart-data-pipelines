require(['jquery', 'jquery-ui', 'angular'],
	function(jquery) {
		require(['app'],
			function(app) {
				try {
					angular.bootstrap(document, ['app']);
			    } catch(e) {
			    	console.log("Error when initializing the application. Please re-load the page.", e);
			    }
			}
		);

	}
);