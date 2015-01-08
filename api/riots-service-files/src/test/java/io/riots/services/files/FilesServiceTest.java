//package io.riots.services.files;
//
//import static org.testng.AssertJUnit.assertNotNull;
//
//import java.io.File;
//import java.io.IOException;
//
//import org.apache.commons.io.FileUtils;
//import org.apache.commons.io.IOUtils;
//import org.junit.runner.RunWith;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.context.embedded.EmbeddedWebApplicationContext;
//import org.springframework.boot.test.IntegrationTest;
//import org.springframework.boot.test.SpringApplicationConfiguration;
//import org.springframework.boot.test.TestRestTemplate;
//import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
//import org.springframework.test.context.web.WebAppConfiguration;
//import org.springframework.web.client.RestTemplate;
//import org.testng.annotations.Test;
//
//import io.riots.api.services.AbstractServiceTest;
//import io.riots.services.FilesService;
//import io.riots.services.files.FilesServiceImpl;
//
//
//@SpringApplicationConfiguration(classes = FilesServiceStarter.class)
//@WebAppConfiguration
//@IntegrationTest({"server.port=0"})
//public class FilesServiceTest {
//
////	@Override
////	protected Class<?> getServiceBeanClass() {
////		return FilesService.class;
////	}
//	@Autowired
//    EmbeddedWebApplicationContext server;
//
//    @Value("${local.server.port}")
//    int port;
//    
//    
//    RestTemplate restTemplate = new TestRestTemplate();
//
//	
//	@Test
//	public void uploadFile() throws IOException {
//		
//		
//		String json = FileUtils.readFileToString(new File("/Users/riox/Code/riots/testPostImage.json"));
//		assertNotNull(json);
//		//restTemplate.postForLocation("http://localhost:"+ port + "/api/v1/files", json);
//	}
//	
//
//}
