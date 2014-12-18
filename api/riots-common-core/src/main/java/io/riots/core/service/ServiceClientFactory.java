package io.riots.core.service;

import java.util.List;

import org.apache.cxf.jaxrs.client.JAXRSClientFactory;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.DiscoveryClient;
import com.netflix.discovery.DiscoveryManager;

/**
 * Factory class for creating service clients.
 * @author whummer
 */
public class ServiceClientFactory {

	private static final String SERVICE_USERS_EUREKA_NAME = "users-service";
	private static final String SERVICE_USERS_ENDPOINT = "http://<host>:<port>/api/v1/users";

	public static IUsers getUsersServiceClient() {
		InstanceInfo i = getService(SERVICE_USERS_EUREKA_NAME);
		String addr = SERVICE_USERS_ENDPOINT.replace("<host>", i.getHostName())
				.replace("<port>", "" + i.getPort());
		return JAXRSClientFactory.create(addr, IUsers.class);
	}

	private static InstanceInfo getService(String name) {
		DiscoveryClient d = DiscoveryManager.getInstance().getDiscoveryClient();
		List<InstanceInfo> list = 
				d.getApplication(SERVICE_USERS_EUREKA_NAME).getInstances();
		if(list.isEmpty())
			throw new RuntimeException("Service '" + name + "' is not available.");
		return list.get(0);
	}

}
