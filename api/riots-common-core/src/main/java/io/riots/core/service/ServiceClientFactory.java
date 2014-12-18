package io.riots.core.service;

import java.util.HashMap;
import java.util.Map;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.stereotype.Component;

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

	public static ICatalogService getCatalogServiceClient(LoadBalancerClient loadBalancer) {
		return getLoadBalancedService(loadBalancer, SERVICE_CATALOG_EUREKA_NAME, ICatalogService.class);
	}

	public static IUsers getUsersServiceClient(LoadBalancerClient loadBalancer) {
		return getLoadBalancedService(loadBalancer, SERVICE_USERS_EUREKA_NAME, IUsers.class);
	}

	public static <T> T getLoadBalancedService(LoadBalancerClient loadBalancer, String name, Class<T> clazz) {
		String endpoint = getLoadBalancedServiceURL(loadBalancer, name);
		T service = JAXRSClientFactory.create(endpoint, clazz);
		return service;
	}

	public static String getLoadBalancedServiceURL(LoadBalancerClient loadBalancer, String name) {
		ServiceInstance i = loadBalancer.choose(name);
		String endpointTemplate = serviceEndpoints.get(name);
		String endpoint = String.format(endpointTemplate, i.getHost(), i.getPort());
		return endpoint;
	}

	/* TODO OLD/LEGACY*/
//	public static IUsers getUsersServiceClient() {
//		// TODO maybe cache rest clients for a certain time
//		InstanceInfo i = getService(SERVICE_USERS_EUREKA_NAME);
//		String addr = SERVICE_USERS_ENDPOINT.replace(
//				"<host>", i.getHostName())
//				.replace("<port>", "" + i.getPort());
//		IUsers service = JAXRSClientFactory.create(addr, IUsers.class);
//		System.out.println(service + " - " + service.getClass());
//		return service;
//	}
//
//	private static InstanceInfo getService(String name) {
//		DiscoveryClient d = DiscoveryManager.getInstance().getDiscoveryClient();
//		List<InstanceInfo> list = 
//				d.getApplication(SERVICE_USERS_EUREKA_NAME).getInstances();
//		if(list.isEmpty())
//			throw new RuntimeException("Service '" + name + "' is not available.");
//		// TODO: integrate Ribbon for load balancing
//		return list.get(0);
//	}

}
