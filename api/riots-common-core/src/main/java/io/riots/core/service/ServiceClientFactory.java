package io.riots.core.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;
import org.springframework.stereotype.Component;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.DiscoveryManager;
import com.netflix.discovery.shared.Application;

/**
 * Factory class for creating service clients.
 * @author whummer
 */
@Component
public class ServiceClientFactory {

	private static final String SERVICE_USERS_EUREKA_NAME = "users-service";
	private static final String SERVICE_USERS_ENDPOINT = "http://%s:%s/api/v1/users";
	private static final String SERVICE_CATALOG_EUREKA_NAME = "catalog-service";
	private static final String SERVICE_CATALOG_ENDPOINT = "http://%s:%s/api/v1/catalog/thing-types";
	private static final Map<String,String> serviceEndpoints = new HashMap<String,String>();

	static {
		serviceEndpoints.put(SERVICE_USERS_EUREKA_NAME, SERVICE_USERS_ENDPOINT);
		serviceEndpoints.put(SERVICE_CATALOG_EUREKA_NAME, SERVICE_CATALOG_ENDPOINT);
	}

	public static IUsers getUsersServiceClient() {
		return getServiceInstanceForName(SERVICE_USERS_EUREKA_NAME, IUsers.class);
	}
	public static ICatalogService getCatalogServiceClient() {
		return getServiceInstanceForName(SERVICE_CATALOG_EUREKA_NAME, ICatalogService.class);
	}

	/* PRIVATE HELPER METHODS */

	private static <T> T getServiceInstanceForName(String name, Class<T> clazz) {
		InstanceInfo i = getService(name);
		String addr = String.format(serviceEndpoints.get(name), i.getHostName(), i.getPort());
		return getServiceInstanceForURL(addr, clazz);
	}
	private static <T> T getServiceInstanceForURL(String endpointURL, Class<T> clazz) {
		// TODO maybe cache rest clients for a limited amount of time
		T service = JAXRSClientFactory.create(endpointURL, clazz);
		return service;
	}
	private static InstanceInfo getService(String name) {
		DiscoveryClient d = DiscoveryManager.getInstance().getDiscoveryClient();
		System.out.println("client " + d);
		Application app = d.getApplication(name);
		System.out.println(app);
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
