package com.viotualize.catalog.command;

import java.net.URI;

import org.apache.http.client.methods.HttpHead;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.netflix.client.ClientFactory;
import com.netflix.client.http.HttpHeaders;
import com.netflix.client.http.HttpRequest;
import com.netflix.client.http.HttpRequest.Verb;
import com.netflix.client.http.HttpResponse;
import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.niws.client.http.RestClient;
import com.viotualize.catalog.Constants;
import com.viotualize.catalog.rest.CatalogService;
import com.viotualize.smo.rest.domain.SmartObject;

/**
 * @author riox
 */
@Component
@Scope("prototype")
public class CreateSmartObjectCommand extends HystrixCommand<SmartObject> {

	static final Logger log = LoggerFactory.getLogger(CatalogService.class);
	private SmartObject smartObject;

	protected CreateSmartObjectCommand() {
		super(HystrixCommandGroupKey.Factory.asKey("SmartObjectCommands"));
	}
	
	public void setSmartObject(SmartObject smo) {
		this.smartObject = smo;
	}

	/*
	 * (non-Javadoc)
	 * @see com.netflix.hystrix.HystrixCommand#run()
	 */
	@Override
	protected SmartObject run() throws Exception {
		log.debug("Running CreateSmartObjectCommand ...");

		// TODO fix this - could not figure out how
    RestClient client = (RestClient) ClientFactory.getNamedClient(Constants.SMART_OBJECT_REST_CLIENT_ID);  // 2

    // TODO need to find a better way to do this Jackson object passing
    ObjectMapper mapper = new ObjectMapper();
		try {
      HttpRequest request = HttpRequest.newBuilder()
   			 .verb(Verb.POST) 
   			 .header("Content-Type", "application/json") // TODO find constants in framework
   			 .uri(new URI(Constants.SMART_OBJECT_URI_PATH))
   			 .entity(mapper.writeValueAsString(smartObject))
   			 .build();
   			
      	HttpResponse response = client.executeWithLoadBalancer(request); 
      	log.info("Status code for " + response.getRequestedURI() + "  :" + response.getStatus());
      
      	// TODO find a better way handle an exception
      	if (response.getStatus() / 100 != 2) {      		
      		throw new RuntimeException("unexpected response: " + response.getStatus());
      	}
      	
      	// TODO need better way to get SmartObject ID from location header (extra header???)	
      	String location = response.getHttpHeaders().getFirstValue("Location");
      	smartObject.setId(location.substring(location.lastIndexOf("/") + 1, location.length()));
      	log.info("return: " + smartObject.getId());
      	return smartObject;
			
			// IRule rule = new AvailabilityFilteringRule();
			// ServerList<DiscoveryEnabledServer> list = new
			// DiscoveryEnabledNIWSServerList("catalog-service-1");
			// ServerListFilter<DiscoveryEnabledServer> filter = new
			// ZoneAffinityServerListFilter<DiscoveryEnabledServer>();
			// ZoneAwareLoadBalancer<DiscoveryEnabledServer> lb =
			// LoadBalancerBuilder.<DiscoveryEnabledServer>newBuilder()
			// .withDynamicServerList(list)
			// .withRule(rule)
			// .withServerListFilter(filter)
			// .buildDynamicServerListLoadBalancer();
			//
			// Server server = lb.chooseServer();

		} catch (Exception exc) {
			throw new RuntimeException("Error while calling client: " + client.getClientName(), exc);
		}

	}

}
