package io.riots.api.services.model;

import java.util.List;

import io.riots.api.model.UserMongo;
import io.riots.core.repositories.UserRepository;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.testng.Assert;


@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {TestMongoEntities.class})
@EnableMongoRepositories(basePackages = {"io.riots.core.repositories"})
@ComponentScan(basePackages = {"io.riots.core.repositories"})
@Configuration
//@EnableDiscoveryClient
@EnableAutoConfiguration
//@EnableConfigurationProperties
public class TestMongoEntities {

    @Autowired
    UserRepository userRepo;

    @Test
    public void testUniqueUserEmail() {
    	String mail = "name1@host.com";

    	UserMongo m1 = new UserMongo();
    	m1.setEmail(mail);
    	m1 = userRepo.save(m1);

    	UserMongo m2 = new UserMongo();
    	m2.setEmail(mail);
    	boolean denied = false;
    	try {
    		m2 = userRepo.save(m2);
		} catch (Exception e) {
			/* expected */
			denied = true;
		}

    	/* find user */
    	List<UserMongo> found = userRepo.findByEmail(m1.getEmail());

    	/* clean up */
    	userRepo.delete(m1);

    	Assert.assertTrue(denied, "Duplicate user email address");
    	Assert.assertEquals(found.size(), 1, "Exactly one user email exists");
    	
    }

}
