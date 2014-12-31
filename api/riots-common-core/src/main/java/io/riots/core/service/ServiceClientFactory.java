package io.riots.core.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;

/**
 * Factory class for creating service clients.
 * todo om: move this piece somewhere else
 * @author whummer
 */
@Component
public class ServiceClientFactory {

	@Autowired
	DiscoveryClient discoveryClient;

	private static final String SERVICE_USERS_EUREKA_NAME = "users-service";
	private static final String SERVICE_USERS_ENDPOINT = "http://%s:%s/api/v1/users";
	private static final String SERVICE_CATALOG_EUREKA_NAME = "catalog-service";
	private static final String SERVICE_CATALOG_ENDPOINT = "http://%s:%s/api/v1/catalog";
	private static final String SERVICE_THINGS_EUREKA_NAME = "environment-service";
	private static final String SERVICE_THINGS_ENDPOINT = "http://%s:%s/api/v1/things";
	private static final String SERVICE_SIMULATION_EUREKA_NAME = "simulation-service";
	private static final String SERVICE_SIMULATION_ENDPOINT = "http://%s:%s/api/v1/simulations";
	private static final Map<String,String> serviceEndpoints = new HashMap<String,String>();

	static {
		serviceEndpoints.put(SERVICE_USERS_EUREKA_NAME, SERVICE_USERS_ENDPOINT);
		serviceEndpoints.put(SERVICE_THINGS_EUREKA_NAME, SERVICE_THINGS_ENDPOINT);
		serviceEndpoints.put(SERVICE_CATALOG_EUREKA_NAME, SERVICE_CATALOG_ENDPOINT);
		serviceEndpoints.put(SERVICE_SIMULATION_EUREKA_NAME, SERVICE_SIMULATION_ENDPOINT);
	}

	public UsersService getUsersServiceClient() {
		return getServiceInstanceForName(SERVICE_USERS_EUREKA_NAME, UsersService.class);
	}
	public ThingsService getThingsServiceClient() {
		return getServiceInstanceForName(SERVICE_THINGS_EUREKA_NAME, ThingsService.class);
	}
	public SimulationService getSimulationsServiceClient() {
		return getServiceInstanceForName(SERVICE_SIMULATION_EUREKA_NAME, SimulationService.class);
	}
	public CatalogService getCatalogServiceClient() {
		return getServiceInstanceForName(SERVICE_CATALOG_EUREKA_NAME, CatalogService.class);
	}

	/* PRIVATE HELPER METHODS */

	private <T> T getServiceInstanceForName(String name, Class<T> clazz) {
		InstanceInfo i = getService(name);
		String addr = String.format(serviceEndpoints.get(name), i.getHostName(), i.getPort());
		return getServiceInstanceForURL(addr, clazz);
	}
	private <T> T getServiceInstanceForURL(String endpointURL, Class<T> clazz) {
		// TODO maybe cache rest clients for a limited amount of time

		List<Object> providers = new ArrayList<>();
		providers.add(new JacksonJaxbJsonProvider());
		T service = JAXRSClientFactory.create(endpointURL, clazz, providers);

		return service;
	}

	private InstanceInfo getService(String name) {
		//DiscoveryClient d = DiscoveryManager.getInstance().getDiscoveryClient();
		DiscoveryClient d = discoveryClient;
		//System.out.println("client " + d);
		Application app = d.getApplication(name);
		//System.out.println(app);
		List<InstanceInfo> list = app.getInstances();
		if(list.isEmpty())
			throw new RuntimeException("Service '" + name + "' is not available.");
		// TODO: integrate Ribbon for load balancing
		return list.get(new Random().nextInt(list.size()));
	}

	// TODO: whu: due to Spring's "dependency hell", I am currently unable to
	// integrate this properly with LoadBalancerClient. Cannot be injected in the
	// clients using this class, for some reason. For now, we do a simple load balancing
	// ourselves (see code in this class). Maybe we can fix this later.
//	public static ICatalogService getCatalogServiceClient(LoadBalancerClient loadBalancer) {
//		return getLoadBalancedService(loadBalancer, SERVICE_CATALOG_EUREKA_NAME, ICatalogService.class);
//	}
//	public static IUsers getUsersServiceClient(LoadBalancerClient loadBalancer) {
//		return getLoadBalancedService(loadBalancer, SERVICE_USERS_EUREKA_NAME, IUsers.class);
//	}
//	public static <T> T getLoadBalancedService(LoadBalancerClient loadBalancer, String name, Class<T> clazz) {
//		String endpoint = getLoadBalancedServiceURL(loadBalancer, name);
//		T service = JAXRSClientFactory.create(endpoint, clazz);
//		return service;
//	}
//	public static String getLoadBalancedServiceURL(LoadBalancerClient loadBalancer, String name) {
//		ServiceInstance i = loadBalancer.choose(name);
//		String endpointTemplate = serviceEndpoints.get(name);
//		String endpoint = String.format(endpointTemplate, i.getHost(), i.getPort());
//		return endpoint;
//	}
}
