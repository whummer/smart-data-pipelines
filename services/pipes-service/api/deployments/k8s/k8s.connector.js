'use strict';

var log = global.log || require('winston');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var request = Promise.promisifyAll(require('request'));
var util = require('util');
var Client = require('node-kubernetes-client');
var modulesRepo = require('./modules.repository');
var _ = require('lodash');

/* K8S Constants */

const SERVICE_ACCOUNT = '/var/run/secrets/kubernetes.io/serviceaccount/token';
const K8S_VERSION = 'v1';
const PREFIX_MODULE_ARTIFACT_ID = "spring-cloud-stream-module-";
const SESSION_AFFINITY_NONE = "None";
const TYPE_CLUSTER_IP = "ClusterIP";
const PROTOCOL_TCP = "TCP";
const IMAGE_PULL_POLICY_ALWAYS = "Always";
const RESTART_POLICY_ALWAYS = "Always";
const DNS_POLICY_CLUSTER_FIRST = "ClusterFirst";

/* Config Constants */

const MODULE_REGISTRY_NAME = "riox";
const MODULE_REGISTRY_SECRET = "rioxregistrykey";

/* Misc. Constants */

const KEY_PORT = 			"port";
const KEY_SERVER_PORT = 	"server.port";
const SPRING_MARKER_KEY = 	"role";
const SPRING_MARKER_VALUE =	"scsm-module";
const SCSM_GROUP = 			"scsm-group";
const SCSM_LABEL = 			"scsm-label";
const SCSM_EXTENSION = 		"scsm-extension";
const SCSM_VERSION = 		"scsm-version";
const SCSM_GROUP_ID = 		"scsm-groupId";
const SCSM_ARTIFACT_ID = 	"scsm-artifactId";
const SCSM_CLASSIFIER = 	"scsm-classifier";

class K8SConnector {

	constructor(config) {

		if(!config) config = {};

		/* connection settings */
		this.hostname = config.hostname || process.env.KUBERNETES_SERVICE_HOST || 'localhost';
		this.port = config.port || process.env.KUBERNETES_SERVICE_PORT || 8080;
		this.protocol = this.port == 443 ? "https" : "http";
		this.namespace = config.namespace || process.env.RIOX_ENV;

		// TODO: make use of these config properties..?
//		/**
//		 * Delay in seconds when the Kubernetes liveness check of the stream module container
//		 * should start checking its health status.
//		 */
//		this.livenessProbeDelay = 180;
//		/**
//		 * Timeout in seconds for the Kubernetes liveness check of the stream module container.
//		 * If the health check takes longer than this value to return it is assumed as 'unavailable'.
//		 */
//		this.livenessProbeTimeout = 2;
//		/**
//		 * Delay in seconds when the readiness check of the stream module container
//		 * should start checking if the module is fully up and running.
//		 */
//		this.readinessProbeDelay = 10;
//		/**
//		 * Timeout in seconds that the stream module container has to respond its
//		 * health status during the readiness check.
//		 */
//		this.readinessProbeTimeout = 2;
//		/**
//		 * Memory to allocate for a Pod.
//		 */
//		this.memory = "512Mi";
//		/**
//		 * CPU to allocate for a Pod (quarter of a CPU).
//		 */
//		this.cpu = "250m";

		this._getClient();
	}

	/**
	 * Deploy a list of containers.
	 */
	deployContainers(list) {
		var self = this;
		var promises = [];
		var containerIDs = [];
		for(var i = 0; i < list.length; i ++) {
			var cont = list[i];

			containerIDs.push(cont[ID]);

			/* set incoming and outgoing links (of the pipe element), 
			 * as well as links between the containers if the pipe element 
			 * consists of multiple containers */
			if(i == 0) {
				cont.previous_id = cont.pipeElement.previous_id;
			}
			if(i == list.length - 1) {
				cont.next_id = cont.pipeElement.next_id;
			}
			if(list.length > 1) {
				if(i > 0) {
					cont.previous_id = cont.pipeElement[ID] + "." + i;
				}
				if(i < list.length - 1) {
					cont.next_id = cont.pipeElement[ID] + "." + (i + 1);
				}
			}

			/* request to deploy this container, promisified */
			var prom = this._deployContainer(cont);
			promises.push(prom);
		}
		return Promise.all(promises).then(result => {
			result = {};
			/* wait until all containers are deployed */
			return self.waitForContainerStatuses(containerIDs).then(statuses => {
				result.status = statuses.length <= 0 ? STATUS_NOT_DEPLOYABLE : STATUS_DEPLOYED;
				for(var status of statuses) {
					if(status.status != STATUS_RUNNING) {
						result.status = STATUS_FAILED;
					}
				}
				log.debug("=> statuses for containerIDs", containerIDs, ":", statuses, "-", result);
				return result;
			});
		});
	}

	/**
	 * Remove the deployed containers for a given pipe element.
	 */
	removeContainers(deploymentInfo) {
		var pipeElementId = deploymentInfo[ID];
		var labels = {};
		labels[SCSM_GROUP] = pipeElementId;
		var self = this;
		self._getClient().then(function(client) {
			return self._findControllersByLabel(labels).then(function(controllers) {
				return Promise.map(controllers, function(controller) {
					//console.log("undeploy single:", controller);
					var uid = controller.metadata.name;
					return new Promise(function(resolve, reject) {
						client.replicationControllers.delete(uid, function(result) {
							console.log("undeploy replicationControllers result", result);
							resolve(result);
						});
					})
				});
			}).then(function() {
				return self._findPodsByLabel(labels).then(function(pods) {
					return Promise.map(pods, function(pod) {
						var uid = pod.metadata.name;
						return new Promise(function(resolve, reject) {
							client.pods.delete(uid, function(result) {
								console.log("undeploy pods result", result);
								resolve(result);
							});
						})
					});
				})
			});
		});
	}

	/**
	 * Some elements in our pipelines are sort of "dummy nodes" which are
	 * visible to the user in the pipeline, but not actually deployed to 
	 * Spring CDF (e.g., map/chart visualization nodes, comment nodes, ...).
	 * 
	 * This method determines whether a given pipe element is an actual pipe 
	 * element that is deployed to CDF or not.
	 */
	isActualPipeElement(pipeEl) {
		var IGNORE_NODES = ["geo-map", "chart"];
		if(pipeEl[CATEGORY] == "sink" && IGNORE_NODES.indexOf(pipeEl[TYPE]) >= 0) {
			return false;
		}
		return true;
	}

	/**
	 * Determine the deployment status for a given pipe element.
	 */
	findStatusForPipeElement(node, environment) {
		var labels = {};
		labels[SCSM_GROUP] = node[ID];
		labels[SCSM_LABEL] = node[TYPE];
		return findStatusForPodLabels(labels);
	}

	/**
	 * Determine the deployment status for a pod with given labels.
	 */
	findStatusForPodLabels(labels) {
		var timeout = 1000*5;
		var numRetries = 5;
		var self = this;
		var loop = function(retries, resolve, reject) {
			if(retries <= 0) {
				return reject({error: "Unable to get k8s deployment status for pod with labels: " + JSON.stringify(labels)});
			}
			self._getPodsStatus(labels).then(status => {
				if(!status.status) {
					return setTimeout(function() {
						loop(retries - 1, resolve, reject);
					}, timeout);
				}
				return resolve(status);
			}).catch(err => {
				reject(err);
			});
		}
		return new Promise(function(resolve, reject) {
			loop(numRetries, resolve, reject);
		});
	}

	/**
	 * Determine the deployment status for a given pipe element. Wait 
	 * until the status is actually available, i.e., is not "Pending".
	 */
	waitForPipeElementStatus(node, environment) {
		var labels = {};
		labels[SCSM_GROUP] = node[ID];
		labels[SCSM_LABEL] = node[TYPE];
		return this.waitForPodStatus(labels);
	}

	/**
	 * Determine the deployment status for pod(s) with the given labels.
	 * Wait until the status is actually available, i.e., is not "Pending".
	 */
	waitForPodStatus(labels) {
		var timeout = 1000 * 10;
		var numRetries = 20;
		var self = this;
		var loop = function(retries, resolve, reject) {
			if(retries <= 0) {
				return reject({error: "Unable to wait for pod deployment status (timeout) for labels: " + JSON.stringify(labels)});
			}
			self.findStatusForPodLabels(labels).then(function(status) {
				if(self._listContains([STATUS_PENDING], status.status)) {
					return setTimeout(function() {
						loop(retries - 1, resolve, reject);
					}, timeout);
				}
				return resolve(status);
			});
		}
		return new Promise(function(resolve, reject) {
			loop(numRetries, resolve, reject);
		});
	}

	waitForContainerStatuses(containerIDs) {
		var self = this;
		return Promise.map(containerIDs, function(containerID) {
			return self.waitForContainerStatus(containerID);
		});
	}

	waitForContainerStatus(containerID) {
		log.debug("waitForContainerStatus", containerID);
		var labels = {};
		labels[NAME] = containerID;
		return this.waitForPodStatus(labels);
	}

	/*
	 * PRIVATE METHODS
	 */

	_deployContainer(container) {
		var self = this;
		return new Promise(function(resolve, reject) {
			var state = {};
			state.container = container;
			var prom = Promise.resolve(state);
			if(self._requiresService(container)) {
				/* create service definition */
				prom = prom.then(function() {
					return self._createService(state);
				});
			}
			/* create replication controller definition */
			prom = prom.then(function() {
				return self._createController(state);
			});
			prom.then(resolve).catch(reject);
		});
	}

	/**
	 * Create a k8s service for a pipe element.
	 */
	_createService(state) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self._getClient().then(function(client) {
				var name = state.container[ID];
				var port = self._getServicePort(state.container);
				var service = {
					metadata: {
						name: name,
						labels: {}
					},
					spec: {
						type: TYPE_CLUSTER_IP,
						selector: {},
						sessionAffinity: SESSION_AFFINITY_NONE,
						ports: [{
							protocol: PROTOCOL_TCP,
							port: port,
							targetPort: port
						}]
					}
				};
				service.spec.selector[SCSM_GROUP] = state.container[ID];
				service.spec.selector[SCSM_LABEL] = state.container.pipeElement[TYPE];
				var labels = service.metadata.labels;
				labels[SPRING_MARKER_KEY] = SPRING_MARKER_VALUE;
				labels[SCSM_GROUP] = state.container[ID];
				labels[SCSM_LABEL] = state.container.pipeElement[TYPE];

				client.services.create(service, function(err, result) {
					if(err && err.message.reason === "AlreadyExists") {
						log.info("Service already exists.", err);
						return resolve(state);
					} else if(err) {
						log.warn("Unable to create Service.", err);
						return reject(err);
					}
					resolve(result);
				});
			});
		});
	}

	/**
	 * Create a k8s replication controller for a pipe element.
	 */
	_createController(state) {
		var self = this;
		return new Promise(function(resolve, reject) {
			self._getClient().then(function(client) {
				var numReplicas = 1; // TODO make configurable
				var name = state.container[ID];
				var templCont = {};
				var rc = {
					metadata: {
						name: name,
						labels: {}
					},
					spec: {
						replicas: numReplicas,
						selector: {},
						template: {
							metadata: {
								labels: {
									name: name
								}
							},
							spec: {
								imagePullSecrets: [{
									name: MODULE_REGISTRY_SECRET
								}],
								dnsPolicy: DNS_POLICY_CLUSTER_FIRST,
								restartPolicy: RESTART_POLICY_ALWAYS,
								containers: [templCont]
							}
						}
					}
				};
				var coordinates = state.container.coordinates;
				/* SET CONTAINER TEMPLATE */
				templCont.name = name;
				templCont.image = self._getImageName(coordinates);
				templCont.imagePullPolicy = IMAGE_PULL_POLICY_ALWAYS;
				templCont.ports = [];
				var port = self._getServicePort(state.container);
				if(port > 0) {
					templCont.ports.push({
						protocol: PROTOCOL_TCP,
						containerPort: port
					});
				}

				/* create command arguments */
				templCont.args = self._getCommandsArgs(state.container);

				/* create environment variables */
				templCont.env = self._getEnvironmentVariables(state.container);

				/* SET LABELS */
				var labels = rc.metadata.labels;
				labels[NAME] = name;
				labels[SPRING_MARKER_KEY] = SPRING_MARKER_VALUE;
				labels[SCSM_ARTIFACT_ID] = coordinates.artifactId;
				labels[SCSM_GROUP_ID] = coordinates.groupId;
				labels[SCSM_VERSION] = coordinates.version;
				labels[SCSM_EXTENSION] = coordinates.extension;
				labels[SCSM_CLASSIFIER] = coordinates.classifier;
				labels[SCSM_GROUP] = state.container.pipeElement[ID];
				labels[SCSM_LABEL] = state.container.pipeElement[TYPE];
				rc.spec.selector[NAME] = name;
				rc.spec.template.metadata.labels[SCSM_GROUP] = state.container.pipeElement[ID];
				rc.spec.template.metadata.labels[SCSM_LABEL] = state.container.pipeElement[TYPE];
				rc.spec.template.metadata.labels[SPRING_MARKER_KEY] = SPRING_MARKER_VALUE;

				//console.log(JSON.stringify(rc, null, '\t'));

				client.replicationControllers.create(rc, function(err, result) {
					if(err && err.message.reason === "AlreadyExists") {
						log.info("Replication Controller already exists.", err);
						return resolve(state);
					} else if(err) {
						log.warn("Unable to create Replication Controller.", err);
						return reject(err);
					}
					resolve(result);
				});
			});
		});
	}

	/**
	 * Determines whether a module exposes a port and hence requires a k8s service.
	 */
	_requiresService(container) {
		var port = this._getServicePort(container);
		return port > 0;
	}

	/**
	 * Returns the k8s service port of a module, or 0 if this module does not expose a port.
	 */
	_getServicePort(container) {
		return !container.pipeElement[PARAMS] ? 0 :
			(container.pipeElement[PARAMS][KEY_PORT] || 
			container.pipeElement[PARAMS][KEY_SERVER_PORT]);
	}

	_getEnvironmentVariables(container) {
		var env = [];
		if(container.env) {
			for(var key in container.env) {
				var envEntry = {
						name: key,
						value: container.env[key]
				};
				env.push(envEntry);
			}
		}
		env.push({
				name: "SPRING_REDIS_HOST",
				value: config.redis.hostname
		});
		return env;
	}

	/**
	 * Construct docker image name for a coordinates map.
	 */
	_getImageName(coordinates) {
		return MODULE_REGISTRY_NAME + "/" + PREFIX_MODULE_ARTIFACT_ID + coordinates.artifactId + ":" + coordinates.version;
	}

	/**
	 * Create command arguments for a module container.
	 */
	_getCommandsArgs(container) {
		var args = [];
		for(var cmd of container.cmdArgs) {
			args.push(cmd);
		}
		if(container.next_id) {
			args.push("--spring.cloud.stream.bindings.output.destination=" + container.next_id);
		}
		if(container.previous_id) {
			args.push("--spring.cloud.stream.bindings.input.destination=" + container.previous_id);
		}
		return args;
	}

	/**
	 * Get deployment status of a pod.
	 */
	_getPodsStatus(podLabels) {
		return this._getClient().then(function(client) {
			return new Promise(function(resolve, reject) {
				client.pods.get(function(err, pods) {
					if(err) {
						log.warn("Unable to list pods", err);
						return reject(err);
					}
					var podList = pods[0].items;
					var state = {};
					for(var pod of podList) {
						if(_.isMatch(pod.metadata.labels, podLabels)) {
							state.status = pod.status.phase.toUpperCase();
							var allReady = true;
							if(pod.status.containerStatuses) {
								for(var contStatus of pod.status.containerStatuses) {
									allReady = allReady && contStatus.ready;
								}
								if(!allReady) {
									state.status = STATUS_PENDING;
								}
							}
							//console.log("==>", state.status);
							return resolve(state);
						}
					}
					return resolve(state);
				});
			});
		});
	}

	/**
	 * Get resources by a map of labels. 'resourceType' can be one of 
	 * "pods" or "replicationControllers".
	 */
	_findResourcesByLabel(labels, resourceType) {
		return this._getClient().then(function(client) {
			return new Promise(function(resolve, reject) {
				client[resourceType].get(function(err, resources) {
					if(err) {
						log.warn("Unable to list " + resourceType, err);
						return reject(err);
					}
					var list = resources[0].items;
					var result = [];
					for(var resource of list) {
						if(_.isMatch(resource.metadata.labels, labels)) {
							result.push(resource);
						}
					}
					return resolve(result);
				});
			});
		});
	}

	/**
	 * Get pods by a map of labels.
	 */
	_findPodsByLabel(labels) {
		return this._findResourcesByLabel(labels, "pods");
	}

	/**
	 * Get replication controllers by a map of labels.
	 */
	_findControllersByLabel(labels) {
		return this._findResourcesByLabel(labels, "replicationControllers");
	}

	/**
	 * Get a client to connect to the K8S API.
	 */
	_getClient() {
		if(this.client) {
			return Promise.resolve(this.client);
		}
		var self = this;
		return fs.readFileAsync(SERVICE_ACCOUNT, 'utf8').then(function(content) {
			self.client = new Client({
				host: self.hostname + ':' + self.port,
				protocol: self.protocol,
				token: content,
				version: K8S_VERSION,
				namespace: process.env.RIOX_ENV
			});
			return self.client;
		}).catch(function(e) {
			log.info('K8S Service account file not found on pod, defaulting to development settings. ' + e);
			self.client = new Client({
				host:  self.hostname + ':' + self.port,
				protocol: self.protocol,
				token: "_empty_", /* seems to be required for development (should not happen in production). */
				version: K8S_VERSION,
				namespace: process.env.RIOX_ENV
			});
			return self.client;
		});
	}

	/**
	 * Check if a list contains a string entry, case-insensitive comparison.
	 */
	_listContains(list, entry) {
		for(var item of list) {
			if(item.toUpperCase() === entry.toUpperCase())
				return true;
		}
		return false;
	}

};

module.exports = K8SConnector;
