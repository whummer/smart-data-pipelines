package com.viotualize.catalog.acceptance;

import static org.testng.Assert.assertEquals;

import java.io.BufferedInputStream;
import java.io.FileReader;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;

import org.apache.coyote.http11.filters.BufferedInputFilter;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.json4s.StringInput;
import org.json4s.jackson.Json;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.testng.annotations.Test;

import com.fasterxml.jackson.core.JsonFactory;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mongodb.util.JSON;
import com.viotualize.api.services.AbstractServiceTest;
import com.viotualize.catalog.core.CatalogEntry;
import com.viotualize.catalog.service.CatalogService;

import scala.util.parsing.json.JSONObject;

/**
 * Acceptance test class for the Catalog REST Service. Does not use any domain classes
 * (on purpose) as it want to deal with JSON according to our specification 
 * (how our users would call it).
 * 
 * @author riox
 */
public class CatalogServiceTest extends AbstractServiceTest {
  
	static final Logger log = LoggerFactory.getLogger(CatalogServiceTest.class);
	
  public static final String URL = "/catalog/entries";
	
	@Test
	public void testCatalogPOST1() throws IOException, URISyntaxException {
		log.info("Executing testCatalogPOST1() ...");
		URL url = getClass().getResource("/catalog-post1.json");
		log.info("Using request file: {}", url.getFile());

		
		CloseableHttpClient client = HttpClientBuilder.create().build();
		HttpPost req = new HttpPost(URL);

			
			RestTemplate template = new RestTemplate();			
			BufferedInputStream in = new BufferedInputStream(url.openStream());
						
			byte[] jsonData = Files.readAllBytes(Paths.get(url.toURI()));
			ObjectMapper objectMapper = new ObjectMapper();
			JsonNode rootNode = objectMapper.readTree(jsonData);
			System.out.println(rootNode.toString());
			
			
			ResponseEntity<Object> response = template.postForEntity(URL, rootNode.toString(), null);
			
			//template.getRequestFactory().
			
			//System.out.println(url.openConnection().getContent().toString());
			
			//template.postForObject(url, request, responseType)
			
		  //HttpResponse response = client.execute(req);
      //assertEquals(response.getStatusLine().getStatusCode(), "201");
      // assertEquals(response.getHeaders("Location"), "/catalog/entries/" + ); // TODO get it
      
		
	}	
	
	
	
	@Test
  public void testCatalogGET() {
		
  }

	@Override
	protected Class<?> getServiceBeanClass() {
		return CatalogService.class;
	}
	
}
