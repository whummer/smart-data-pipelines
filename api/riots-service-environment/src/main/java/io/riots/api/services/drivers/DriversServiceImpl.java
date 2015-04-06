package io.riots.api.services.drivers;

import io.riots.api.drivers.mqtt.DriverUtilMQTT;
import io.riots.core.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.DeviceDriverRepository;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.sim.SimulationService;
import io.riots.api.services.drivers.DataDriver.DriverConnector;
import io.riots.api.services.sim.PropertySimulation;
import io.riots.api.services.sim.Simulation;
import io.riots.api.services.sim.SimulationType;
import io.riots.api.services.users.User;

import java.net.URI;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
@Path("/drivers")
public class DriversServiceImpl implements DriversService {

    @Autowired
    DeviceDriverRepository driverRepo;

    @Autowired
    AuthHeaders authFilter;
    @Autowired
    HttpServletRequest req;
    @Context
    MessageContext context;

    @Autowired
    DriverUtilMQTT mqttUtil;
    @Autowired
    ServiceClientFactory clientFactory;

    @Override
    @Timed @ExceptionMetered
    public DataDriver retrieve(String itemId) {
        return driverRepo.findOne(itemId);
    }

    @Override
    @Timed @ExceptionMetered
    public DataDriver retrieveForThingType(String itemId) {
    	List<DataDriver> list = driverRepo.findByThingTypeId(itemId);
    	if(list.isEmpty()) {
    		return null;
    	} else if(list.size() > 1) {
    		throw new IllegalStateException("Expected at most one driver, got: " + list);
    	}
    	return list.get(0);
    }

    @Override
    @Timed @ExceptionMetered
    public DataDriver retrieveForThing(String thingId, String propertyName) {
    	List<DataDriver> list = driverRepo.findByThingIdAndPropertyName(thingId, propertyName);
    	if(list.isEmpty()) {
    		return null;
    	} else if(list.size() > 1) {
    		throw new IllegalStateException("Expected at most one driver, got: " + list);
    	}
    	return list.get(0);
    }

    @Override
    @Timed @ExceptionMetered
    public DataDriver setForThing(String thingId, String propertyName, DataDriver driver) {
    	User user = authFilter.getRequestingUser(req);
    	driver.setCreatorId(user.getId());
    	driver.setThingId(thingId);
    	driver.setPropertyName(propertyName);
        DataDriver d = retrieveForThing(thingId, propertyName);
        String oldDriverId = null;
    	if(d != null) {
    		oldDriverId = d.getId();
    		driver.setId(oldDriverId);
    		stopDriver(d);
    	}
    	driver = driverRepo.save(driver);
    	startDriver(driver, user);
        URI uri = UriBuilder.fromPath("/drivers/{id}").build(driver.getId());
        ServiceUtil.setLocationHeader(context, uri);
        return driver;
    }

	@Override
	public void resetFor(String thingId, String propertyName) {
		DataDriver d = retrieveForThing(thingId, propertyName);
		driverRepo.delete(d);
	}

	@Override
    @Timed @ExceptionMetered
    public boolean delete(String itemId) {
        driverRepo.delete(itemId);
        return true;
    }

    /* HELPER METHODS */

    private void stopDriver(DataDriver driver) {
    	DriverConnector driverConnector = driver.getConnector();
    	String driverId = driver.getId();
    	if(driverConnector == DriverConnector.MQTT) {
    		mqttUtil.stop(driverId);
    	} else if(driverConnector == DriverConnector.RIOTS_SIMULATION) {
    		SimulationService simService = clientFactory.getSimulationsServiceClient();
    		simService.stopSimulation(driver.getThingId(), driver.getPropertyName());
			String thingId = driver.getThingId();
			String propertyName = driver.getPropertyName();
			List<Simulation> simulationsToDelete = simService.listSimulations(thingId, propertyName, 0, 0);
			// todo why has the array a single NULL element
			if (!simulationsToDelete.isEmpty() && simulationsToDelete.get(0) != null) {
				simService.deleteSimulation(simulationsToDelete.get(0).getId());
			}
    	}
    }
    private void startDriver(DataDriver driver, User creator) {
    	DriverConnector driverConnector = driver.getConnector();
    	String driverId = driver.getId();
    	if(driverConnector == DriverConnector.MQTT) {
    		mqttUtil.start(driverId, driver);
    	} else if(driverConnector == DriverConnector.RIOTS_SIMULATION) {
    		/* get reference to simulation clients */
    		SimulationService simService = clientFactory.getSimulationsServiceClient();
    		/* construct new simulation */
    		DataDriverSimulation driverSim = (DataDriverSimulation)driver;
    		if(driverSim.getSimulationId() == null) {
    			throw new IllegalArgumentException("Invalid simulation ID provided: " + driverSim.getSimulationId());
    		}
    		SimulationType simType = simService.retrieveSimType(driverSim.getSimulationId());
    		if(simType == null) {
    			throw new IllegalArgumentException("Unable to find simulation type ID: " + driverSim.getSimulationId());
    		}
    		Simulation sim = new Simulation();
//    		sim.setName();
			sim.setCreatorId(driver.getCreatorId());
    		PropertySimulation<?> propSim = simType.getSimulation();
    		propSim.fillInParameters(driverSim.getParameters());
    		propSim.setPropertyName(driver.getPropertyName());
    		propSim.setThingId(driver.getThingId());
    		sim.getSimulationProperties().add(propSim);
    		/* post new simulation to simulation clients */
    		simService.startSimulation(sim);
			simService.create(sim);
    	}
    }

}
