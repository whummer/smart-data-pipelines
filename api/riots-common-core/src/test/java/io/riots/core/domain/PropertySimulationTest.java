package io.riots.core.domain;

import io.riots.core.model.sim.PropertySimulationFunctionBased;
import io.riots.core.repositories.PropertySimulationRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

/**
 * @author whummer
 */
@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath*:riots-mongodb-config-test.xml")
public class PropertySimulationTest {

    @Autowired
    PropertySimulationRepository repository;

    @Before
    public void setup() {
    }

    @Test
    public void querySimulations() {
    	repository.findAll();
    	PropertySimulationFunctionBased sim = new PropertySimulationFunctionBased();
    	sim = repository.save(sim);
    	sim = (PropertySimulationFunctionBased)repository.findOne(sim.getId());
    	repository.delete(sim.getId());
    }

}
