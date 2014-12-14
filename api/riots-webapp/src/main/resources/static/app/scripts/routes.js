define([], function() {
	var appRoot = appConfig["appRootPath"];
    return {
        defaultRoutePath: '/',
        defaultDependencies: [
			appRoot + '/scripts/controllers/AppController.js',
		],
        routes: {
            '/': {
                templateUrl: appRoot + '/views/home.html',
                dependencies: [
                    appRoot + '/scripts/controllers/HomeViewController.js'
                ]
            },
            '/home': {
                templateUrl: appRoot + '/views/home.html',
                dependencies: [
                    appRoot + '/scripts/controllers/HomeViewController.js'
                ]
            },
            '/meta': {
                templateUrl: appRoot + '/views/metadata.html',
                dependencies: [
                    appRoot + '/scripts/controllers/MetadataViewController.js'
                ]
            },
            '/catalog': {
                templateUrl: appRoot + '/views/catalog.html',
                dependencies: [
                    appRoot + '/scripts/controllers/CatalogViewController.js'
                ]
            },
            '/catalog/:deviceTypeID': {
                templateUrl: appRoot + '/views/device_type.html',
                dependencies: [
                    appRoot + '/scripts/controllers/CatalogViewController.js'
                ]
            },
            '/world': {
                templateUrl: appRoot + '/views/world.html',
                dependencies: [
                    appRoot + '/scripts/controllers/World3DController.js',
                    appRoot + '/scripts/controllers/WorldViewController.js'
                ]
            },
            '/world/:deviceID': {
                templateUrl: appRoot + '/views/world_asset.html',
                dependencies: [
                    appRoot + '/scripts/controllers/World3DController.js',
                    appRoot + '/scripts/controllers/WorldViewController.js'
                ]
            },
            '/login': {
                templateUrl: appRoot + '/views/login.html',
                dependencies: [
                ]
            }
        }
    };
});