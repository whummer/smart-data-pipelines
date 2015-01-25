define([], function() {
	var appRoot = appConfig["appRootPath"];
    return {
        defaultRoutePath: '/',
        defaultDependencies: [
			//appRoot + '/scripts/controllers/AppController.js',
		],
        routes: {
            '/': {
                templateUrl: appRoot + '/views/home.html',
                dependencies: [
                    appRoot + '/scripts/controllers/HomeViewController.js',
                ]
            },
            '/home': {
                templateUrl: appRoot + '/views/home.html',
                dependencies: [
                    appRoot + '/scripts/controllers/HomeViewController.js',
                ]
            },
            '/catalog': {
                templateUrl: appRoot + '/views/catalog.html',
                dependencies: [
                    appRoot + '/scripts/controllers/CatalogViewController.js',
                ]
            },
            '/catalog/:thingTypeID': {
                templateUrl: appRoot + '/views/thing_type.html',
                dependencies: [
                    appRoot + '/scripts/controllers/CatalogViewController.js',
                ]
            },
            '/apps': {
                templateUrl: appRoot + '/views/apps.html',
                dependencies: [
                    appRoot + '/scripts/controllers/AppsViewController.js',
                ]
            },
            '/apps/:appId': {
               	templateUrl: appRoot + '/views/apps_details.html',
                dependencies: [
                    //appRoot + '/scripts/controllers/World3DController.js',
                    appRoot + '/scripts/controllers/AppsViewController.js',
                    appRoot + '/scripts/controllers/SimViewController.js'
                ]
            },
            '/things/:thingId': {
               	templateUrl: appRoot + '/views/apps_thing.html',
                dependencies: [
                    appRoot + '/scripts/controllers/AppsViewController.js'
                ]
            },
            '/sim': {
                templateUrl: appRoot + '/views/sim.html',
                dependencies: [
                    appRoot + '/scripts/controllers/SimViewController.js',
                ]
            },
            '/profile': {
                templateUrl: appRoot + '/views/profile.html',
                dependencies: [
                    appRoot + '/scripts/controllers/ProfileViewController.js',
                ]
            },
            '/meta': {
                templateUrl: appRoot + '/views/metadata.html',
                dependencies: [
                    appRoot + '/scripts/controllers/MetadataViewController.js',
                ]
            },
            '/login/:loginAction': {
                templateUrl: appRoot + '/views/login.html',
                dependencies: [
                    //appRoot + '/scripts/controllers/LoginViewController.js'
                ]
            },
            '/connect': {
                templateUrl: appRoot + '/views/connect.html',
                dependencies: [
                    appRoot + '/scripts/controllers/ConnectViewController.js'
                ]
            },
            '/admin': {
                templateUrl: appRoot + '/views/admin.html',
                dependencies: [
                    appRoot + '/scripts/controllers/AdminViewController.js'
                ]
            },
            '/terms': {
                templateUrl: appRoot + '/views/terms_of_service.html'
            }
        }
    };
});