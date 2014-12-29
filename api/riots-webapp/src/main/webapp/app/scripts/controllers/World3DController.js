function World3DController($scope, $http, $compile) {

	$scope.minAltitude = 0;
	var zoomLevel = $scope.zoomLevel = 19;
	var tileSize = $scope.tileSize = 1;
	if(!$scope.sceneObjects) $scope.sceneObjects = [];
	if(!$scope.sceneMaterials) $scope.sceneMaterials = {};
	if(!$scope.geometryModels) $scope.geometryModels = {};

	/* TODO lazy loading of geometry... */
	require(["riot/threejs-utils", "threejs"],
		function () {
			//console.log("loadSTLFile");
			loadSTLFile("/models/person.stl", function(arg) {
				//console.log("STL loaded", arg);
				$scope.geometryModels["person"] = arg;
			});
			$scope.geometryModels["box"] = new THREE.BoxGeometry(1,1,1);
		}
	);

	$scope.addObjectToScene = function(geometry, position, material, assetObj) {
		if(!material) {
			material = new THREE.MeshPhongMaterial();
		}
		if(!position) {
			position = {x: 0, y: 0, z: 0};
		}

		var mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(position.x, position.y, position.z);
		if(mesh.position.y < $scope.minAltitude) {
			mesh.position.y = $scope.minAltitude;
		}
		if(assetObj) {
			mesh.assetObj = assetObj;
		}
		/* export geometry */
		var exported = $scope.exportObject(mesh);
		//console.log("exported sceneObject", exported);
		if(exported) {
			$scope.sceneObjects.push({
				exported: exported,
				mesh: mesh,
				assetObj: assetObj
			});
		}
		/* add to scene */
		//console.log("adding mesh to scene:", mesh.position, mesh, $scope.editor);
		$scope.editor.addObject(mesh);
		$scope.editor.signals.cameraChanged.dispatch($scope.viewport.camera);
		return mesh;
	}

	$scope.dumpSceneObjects = function() {
		sceneObjects = $scope.sceneObjects = [];
		$.each($scope.editor.scene.children, function(idx,mesh) {
			var exported = $scope.exportObject(mesh);
			if(exported) {
				sceneObjects.push({
					exported: exported,
					mesh: mesh,
					assetObj: mesh.assetObj
				});
			}
		});
	}

	function fixGeometryObject(geometry) {
		/* dirty hack to fix data export/import of threejs */
		$.each(geometry.materials, function(idx,mat) {
			if(!mat.parameters) {
				mat.parameters = JSON.parse(JSON.stringify(mat));
			}
		});
		if(geometry.object) {
			if(!geometry.objects) {
				geometry.objects = [];
			}
			if(!byMember(geometry.objects, "uuid", geometry.object.uuid)) {
				geometry.objects.push(geometry.object);
			}
		}
		if(!geometry.defaults) {
			geometry.defaults = {};
		}
	}

	$scope.exportObject = function(mesh) {
		if(!mesh) {
			console.warn("exportObject called with undefined mesh.");
			return;
		}
		if(!mesh.geometry || !mesh.assetObj) {
			return null;
		}
		var result = {};
		var geometry = new THREE.ObjectExporter().parse(mesh);
		fixGeometryObject(geometry);
		//console.log("exportObject", geometry, mesh);
		result.geometry = geometry;
		result.assetObj = mesh.assetObj;
		var locLatLng = convertMercatorToLatLon(zoomLevel, 
			mesh.position.x, mesh.position.z, tileSize);
		result.location = {
			latitude: locLatLng.lat,
			longitude: locLatLng.lng,
			altitude: mesh.position.y
		}
		return result;
	}

	$scope.unexportObject = function(obj, callback) {
		if(!obj.exported || !obj.exported.geometry) {
			console.log("WARN: exported object has no geometry: ", obj);
		}
		var geometry = obj.exported.geometry;
		var location = obj.exported.location;
		fixGeometryObject(geometry);
		var mesh = new THREE.ObjectLoader().parse(geometry);
		//console.log("unexport:", geometry, mesh);
		var locMerc = convertLatLonToMercator(zoomLevel, 
			location.latitude, location.longitude, false, tileSize);
		mesh.position.set(locMerc.x, location.altitude, locMerc.y);
		//console.log("mesh.position", mesh.position, location);
		mesh.assetObj = obj.exported.assetObj;
		return mesh;
	}

	$scope.init3DView = function(callback) {
		if(!$scope.shared.editor3DContext) {
			initThreeJS(function (three) {
				var ctx = {};
				/* save context for re-use */
				//$scope.shared.editor3DContext = ctx;
				/* create editor */
				ctx.editor = new Editor();
				/* reset editor config */
				ctx.editor.config.clear();
				/* set viewport */
				ctx.viewport = new Viewport(ctx.editor).setId('viewport');
				/* callback */
				$scope.setInfoAndCallback(ctx, callback);
			});
		} else {
			$scope.setInfoAndCallback($scope.shared.editor3DContext, callback);
		}
	}

	$scope.setInfoAndCallback = function(ctx, callback) {
		/* set info */
		$scope.editor = ctx.editor;
		$scope.viewport = ctx.viewport;
		/* callback */
		if(callback)
			callback($scope.editor, $scope.viewport);
	}

	$scope.getSceneMaterial = function(id) {
		if($scope.sceneMaterials[id]) {
			return $scope.sceneMaterials[id];
		}
		var color = THREE.ColorKeywords[id];
		if(!color) {
			console.log("Cannot find material ", id);
			color = THREE.ColorKeywords["white"];
		}
		var material = new THREE.MeshPhongMaterial({color: color});
		$scope.sceneMaterials[id] = material;
		return material;
	}
	
	$scope.setObjectColor = function(mesh, color) {
		//console.log("$scope.setObjectColor", color, mesh);
		mesh.material = $scope.getSceneMaterial(color);
		$scope.editor.signals.cameraChanged.dispatch($scope.viewport.camera);
	}

	$scope.getGeometryModel = function(id, size) {
		if(!size) {
			size = 0.05;
		}
		if(!id) {
			id = "box";
		}
		var geom = $scope.geometryModels[id];
		if(geom) {
			scaleObjectTo(geom, size);
			return geom.clone();
		}
		/* fallback: simple box */
		return new THREE.BoxGeometry(size, size, size);
	}

}
