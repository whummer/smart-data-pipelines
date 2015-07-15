package io.riots.core.clients;

import io.riots.api.services.applications.ApplicationsService;
import io.riots.api.services.billing.BillingService;
import io.riots.api.services.catalog.CatalogService;
import io.riots.api.services.files.FilesService;
import io.riots.api.services.scenarios.ThingDataService;
import io.riots.api.services.scenarios.ThingsService;
import io.riots.api.services.sim.SimulationService;
import io.riots.api.services.statistics.GatewayStatsService;
import io.riots.api.services.tenants.OrganizationsService;
import io.riots.api.services.users.AuthInfo;
import io.riots.api.services.users.UsersService;
import io.riots.core.auth.AuthHeaders;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;
import org.apache.cxf.jaxrs.client.JAXRSClientFactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.jaxrs.json.JacksonJaxbJsonProvider;
import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.shared.Application;

/**
 * Factory class for creating clients clients.
 * todo om: move this piece somewhere else
 * @author whummer
 */
@Component
public class ServiceClientFactory {

	@Autowired
	DiscoveryClient discoveryClient;

	private static final String DEFAULT_SERVICE_ENDPOINT = "http://%s:%s/api/v1/";

	public static final String SERVICE_FILES_EUREKA_NAME = "files-service";
	private static final String SERVICE_FILES_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_USERS_EUREKA_NAME = "users-service";
	private static final String SERVICE_USERS_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_ORGANIZATIONS_EUREKA_NAME = "users-service";
	private static final String SERVICE_ORGANIZATIONS_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_APP_EUREKA_NAME = "environment-service";
	private static final String SERVICE_APP_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_CATALOG_EUREKA_NAME = "catalog-service";
	private static final String SERVICE_CATALOG_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_THINGS_EUREKA_NAME = "environment-service";
	private static final String SERVICE_THINGS_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_THINGDATA_EUREKA_NAME = "environment-service";
	private static final String SERVICE_THINGDATA_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_SIMULATION_EUREKA_NAME = "simulation-service";
	private static final String SERVICE_SIMULATION_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_BILLING_EUREKA_NAME = "users-service";
	private static final String SERVICE_BILLING_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_GWSTATS_EUREKA_NAME = "gateway-service";
	private static final String SERVICE_GWSTATS_ENDPOINT = "http://%s:%s/";

	private static final Map<Class<?>,ServiceInfo> serviceEndpointsByInterface = new HashMap<>();
	private static final Map<String,ServiceInfo> serviceEndpointsByEurekaName = new HashMap<>();
	private static final Method methodGetBean;

	private static class ServiceInfo {
//		Class<?> serviceInterface;
		String eurekaName;
		String endpoint;
		public ServiceInfo(Class<?> serviceInterface, String eurekaName, String endpoint) {
//			this.serviceInterface = serviceInterface;
			this.eurekaName = eurekaName;
			this.endpoint = endpoint;
		}
	}
	private static void addMapping(Class<?> clazz, String eurekaName, String endpoint) {
		ServiceInfo info = new ServiceInfo(clazz, eurekaName, endpoint);
		serviceEndpointsByInterface.put(clazz, info);
		serviceEndpointsByEurekaName.put(eurekaName, info);
	}

	static {

		addMapping(UsersService.class, SERVICE_USERS_EUREKA_NAME, SERVICE_USERS_ENDPOINT);
		addMapping(ThingsService.class, SERVICE_THINGS_EUREKA_NAME, SERVICE_THINGS_ENDPOINT);
		addMapping(ThingDataService.class, SERVICE_THINGDATA_EUREKA_NAME, SERVICE_THINGDATA_ENDPOINT);
		addMapping(CatalogService.class, SERVICE_CATALOG_EUREKA_NAME, SERVICE_CATALOG_ENDPOINT);
		addMapping(SimulationService.class, SERVICE_SIMULATION_EUREKA_NAME, SERVICE_SIMULATION_ENDPOINT);
		addMapping(GatewayStatsService.class, SERVICE_GWSTATS_EUREKA_NAME, SERVICE_GWSTATS_ENDPOINT);
		addMapping(ApplicationsService.class, SERVICE_APP_EUREKA_NAME, SERVICE_APP_ENDPOINT);
		addMapping(FilesService.class, SERVICE_FILES_EUREKA_NAME, SERVICE_FILES_ENDPOINT);
		addMapping(BillingService.class, SERVICE_BILLING_EUREKA_NAME, SERVICE_BILLING_ENDPOINT);
		addMapping(OrganizationsService.class, SERVICE_ORGANIZATIONS_EUREKA_NAME, SERVICE_ORGANIZATIONS_ENDPOINT);

		/* reflection for client creation (add custom headers later) */
		try {
			methodGetBean = JAXRSClientFactory.class.getDeclaredMethod(
					"getBean", String.class, Class.class, String.class);
			methodGetBean.setAccessible(true);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}

	}

	public UsersService getUsersServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForInterface(UsersService.class, headersMap);
	}
	public OrganizationsService getOrganizationsServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForInterface(OrganizationsService.class, headersMap);
	}
	public ThingsService getThingsServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForInterface(ThingsService.class, headersMap);
	}
	public ApplicationsService getApplicationsServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForInterface(ApplicationsService.class, headersMap);
	}
	public BillingService getBillingServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForInterface(BillingService.class, headersMap);
	}
	public FilesService getFilesServiceClient() {
		return getServiceInstanceForInterface(FilesService.class);
	}
	public ThingDataService getThingDataServiceClient() {
		return getServiceInstanceForInterface(ThingDataService.class);
	}
	public SimulationService getSimulationsServiceClient() {
		return getServiceInstanceForInterface(SimulationService.class);
	}
	public CatalogService getCatalogServiceClient() {
		return getServiceInstanceForInterface(CatalogService.class);
	}
	public GatewayStatsService getGatewayStatsServiceClient() {
		return getServiceInstanceForInterface(GatewayStatsService.class);
	}

	/* HELPER METHODS */

	public String getServiceUrlForInterface(Class<?> service) {
		String name = serviceEndpointsByInterface.get(service).eurekaName;
		return getServiceUrlForName(name);
	}
	private String getServiceUrlForName(String name) {
		InstanceInfo i = getService(name);
		String endpoint = serviceEndpointsByEurekaName.get(name).endpoint;
		return String.format(endpoint, i.getIPAddr(), i.getPort());
	}

	private <T> T getServiceInstanceForInterface(Class<T> serviceInterface) {
		String serviceName = serviceEndpointsByInterface.get(serviceInterface).eurekaName;
		return getServiceInstanceForName(serviceName, serviceInterface);
	}
	private <T> T getServiceInstanceForInterface(Class<T> serviceInterface, Map<String, String> headersMap) {
		String serviceName = serviceEndpointsByInterface.get(serviceInterface).eurekaName;
		return getServiceInstanceForName(serviceName, serviceInterface, headersMap);
	}
	private <T> T getServiceInstanceForName(String name, Class<T> clazz) {
		return getServiceInstanceForName(name, clazz, null);
	}
	private <T> T getServiceInstanceForName(String name, Class<T> clazz, Map<String,String> headers) {
		if(headers == null) {
			headers = new HashMap<>();
		}
		AuthInfo info = AuthHeaders.THREAD_AUTH_INFO.get().get();
		if(info != null) {
			if(!headers.containsKey(AuthHeaders.HEADER_AUTH_USER_ID))
				headers.put(AuthHeaders.HEADER_AUTH_USER_ID, info.getUserID());
			if(!headers.containsKey(AuthHeaders.HEADER_AUTH_EMAIL))
				headers.put(AuthHeaders.HEADER_AUTH_EMAIL, info.getEmail());
			if(info.isInternalCall())
				headers.put(AuthHeaders.HEADER_INTERNAL_CALL, "true");
		}
		String addr = getServiceUrlForName(name);

		return getServiceInstanceForURL(addr, clazz, headers);
	}
	public <T> T getServiceInstanceForURL(String endpointURL, Class<T> clazz) {
		return getServiceInstanceForURL(endpointURL, clazz, null);
	}

	// todo om: check whether this is a performance hitter (seems to me likely)
	public <T> T getServiceInstanceForURL(String endpointURL, Class<T> clazz, Map<String,String> headers) {
		// TODO maybe cache REST clients for a limited amount of time

		List<Object> providers = new ArrayList<>();
		providers.add(new JacksonJaxbJsonProvider());
		T service = null;

		if(headers != null && !headers.isEmpty()) {
			try {
				JAXRSClientFactoryBean bean = (JAXRSClientFactoryBean)
						methodGetBean.invoke(null, endpointURL, clazz, null);
				for(String s : new HashSet<>(headers.keySet())) {
					if(headers.get(s) == null) {
						headers.put(s, "");
					}
				}
				//System.out.println("--> headers " + headers);
				bean.setHeaders(headers);
				bean.setProviders(providers);
				service = bean.create(clazz, new Object[0]);
			} catch (Exception e) {
				throw new RuntimeException(e);
			}
		} else {
			service = JAXRSClientFactory.create(endpointURL, clazz, providers);
		}

		return service;
	}

	private InstanceInfo getService(String name) {
		Application app = discoveryClient.getApplication(name);
		List<InstanceInfo> list = app.getInstances();
		if(list.isEmpty())
			throw new RuntimeException("Service '" + name + "' is not available.");

		// TODO: integrate Ribbon for load balancing
		return list.get(new Random().nextInt(list.size()));
	}

	@SuppressWarnings("unchecked")
	private Map<String, String> merge(Map<?,?> ... headers) {
		if(headers == null || headers.length <= 0) {
			return null;
		} if(headers.length == 1) {
			return (Map<String,String>)headers[0];
		}
		Map<String, String> result = new HashMap<>();
		for(Map<?, ?> m : headers) {
			result.putAll((Map<String,String>)m);
		}
		return result;
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
//		T clients = JAXRSClientFactory.create(endpoint, clazz);
//		return clients;
//	}
//	public static String getLoadBalancedServiceURL(LoadBalancerClient loadBalancer, String name) {
//		ServiceInstance i = loadBalancer.choose(name);
//		String endpointTemplate = serviceEndpoints.get(name);
//		String endpoint = String.format(endpointTemplate, i.getHost(), i.getPort());
//		return endpoint;
//	}

}
