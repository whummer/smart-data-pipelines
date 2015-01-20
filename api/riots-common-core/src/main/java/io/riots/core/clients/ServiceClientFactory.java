package io.riots.core.clients;

import io.riots.core.auth.AuthHeaders;
import io.riots.core.auth.AuthHeaders.AuthInfo;
import io.riots.api.services.applications.ApplicationsService;
import io.riots.api.services.catalog.CatalogService;
import io.riots.api.services.files.FilesService;
import io.riots.api.services.statistics.GatewayStatsService;
import io.riots.api.services.sim.SimulationService;
import io.riots.api.services.scenarios.ThingDataService;
import io.riots.api.services.scenarios.ThingsService;
import io.riots.api.services.users.UsersService;

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
	public static final String SERVICE_FILES_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_USERS_EUREKA_NAME = "users-service";
	public static final String SERVICE_USERS_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_APP_EUREKA_NAME = "environment-service";
	public static final String SERVICE_APP_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_CATALOG_EUREKA_NAME = "catalog-service";
	public static final String SERVICE_CATALOG_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_THINGS_EUREKA_NAME = "environment-service";
	public static final String SERVICE_THINGS_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_THINGDATA_EUREKA_NAME = "environment-service";
	public static final String SERVICE_THINGDATA_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_SIMULATION_EUREKA_NAME = "simulation-service";
	public static final String SERVICE_SIMULATION_ENDPOINT = DEFAULT_SERVICE_ENDPOINT;
	public static final String SERVICE_GWSTATS_EUREKA_NAME = "gateway-service";
	public static final String SERVICE_GWSTATS_ENDPOINT = "http://%s:%s/";

	private static final Map<String,String> serviceEndpoints = new HashMap<String,String>();
	private static final Method methodGetBean;

	static {
		serviceEndpoints.put(SERVICE_USERS_EUREKA_NAME, SERVICE_USERS_ENDPOINT);
		serviceEndpoints.put(SERVICE_THINGS_EUREKA_NAME, SERVICE_THINGS_ENDPOINT);
		serviceEndpoints.put(SERVICE_THINGDATA_EUREKA_NAME, SERVICE_THINGDATA_ENDPOINT);
		serviceEndpoints.put(SERVICE_CATALOG_EUREKA_NAME, SERVICE_CATALOG_ENDPOINT);
		serviceEndpoints.put(SERVICE_SIMULATION_EUREKA_NAME, SERVICE_SIMULATION_ENDPOINT);
		serviceEndpoints.put(SERVICE_GWSTATS_EUREKA_NAME, SERVICE_GWSTATS_ENDPOINT);
		serviceEndpoints.put(SERVICE_APP_EUREKA_NAME, SERVICE_APP_ENDPOINT);
		serviceEndpoints.put(SERVICE_FILES_EUREKA_NAME, SERVICE_FILES_ENDPOINT);

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
		return getServiceInstanceForName(SERVICE_USERS_EUREKA_NAME, UsersService.class, headersMap);
	}
	public ThingsService getThingsServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForName(SERVICE_THINGS_EUREKA_NAME, ThingsService.class, headersMap);
	}
	public ApplicationsService getApplicationsServiceClient(Map<?,?> ... headers) {
		Map<String,String> headersMap = merge(headers);
		return getServiceInstanceForName(SERVICE_APP_EUREKA_NAME, ApplicationsService.class, headersMap);
	}
	public FilesService getFilesServiceClient() {
		return getServiceInstanceForName(SERVICE_FILES_EUREKA_NAME, FilesService.class);
	}
	public ThingDataService getThingDataServiceClient() {
		return getServiceInstanceForName(SERVICE_THINGDATA_EUREKA_NAME, ThingDataService.class);
	}
	public SimulationService getSimulationsServiceClient() {
		return getServiceInstanceForName(SERVICE_SIMULATION_EUREKA_NAME, SimulationService.class);
	}
	public CatalogService getCatalogServiceClient() {
		return getServiceInstanceForName(SERVICE_CATALOG_EUREKA_NAME, CatalogService.class);
	}
	public GatewayStatsService getGatewayStatsServiceClient() {
		return getServiceInstanceForName(SERVICE_GWSTATS_EUREKA_NAME, GatewayStatsService.class);
	}

	/* HELPER METHODS */

	public String getServiceUrlForName(String name) {
		InstanceInfo i = getService(name);
		return String.format(serviceEndpoints.get(name), i.getHostName(), i.getPort());
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
				System.out.println("--> headers " + headers);
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
