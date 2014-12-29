package io.riots.api.services;

import io.riots.api.data.drivers.DriverUtilMQTT;
import io.riots.api.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.DeviceDriverRepository;
import io.riots.core.service.DriversService;
import io.riots.services.drivers.DataDriver;
import io.riots.services.drivers.DataDriver.DriverConnector;
import io.riots.services.users.User;

import java.net.URI;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Override
    public DataDriver retrieve(String itemId) {
        return driverRepo.findOne(itemId);
    }

    @Override
    public DataDriver retrieveForThingType(String itemId) {
//    	User user = authFilter.getRequestingUser(req);
//      return driverRepo.findByThingTypeIdAndCreatorIdOrThingTypeIdAndCreatorIdIsNull(itemId, user, itemId);
    	List<DataDriver> list = driverRepo.findByThingTypeId(itemId);
    	if(list.isEmpty()) {
    		return null;
    	} else if(list.size() > 1) {
    		throw new IllegalStateException("Expected at most one driver, got: " + list);
    	}
    	return list.get(0);
    }

    @Override
    public DataDriver retrieveForThing(String thingId, String propertyName) {
//    	User user = authFilter.getRequestingUser(req);
//        return driverRepo.findByThingIdAndCreatorIdOrThingIdAndCreatorIdIsNull(itemId, user, itemId);
    	List<DataDriver> list = driverRepo.findByThingIdAndPropertyName(thingId, propertyName);
    	if(list.isEmpty()) {
    		return null;
    	} else if(list.size() > 1) {
    		throw new IllegalStateException("Expected at most one driver, got: " + list);
    	}
    	return list.get(0);
    }

    @Override
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
    		stopDriver(d.getConnector(), oldDriverId);
    	}
    	driver = driverRepo.save(driver);
    	startDriver(driver.getConnector(), driver.getId(), driver);
        URI uri = UriBuilder.fromPath("/drivers/{id}").build(driver.getId());
        ServiceUtil.setLocationHeader(context, uri);
        return driver;
    }

    @Override
    public boolean delete(String itemId) {
        driverRepo.delete(itemId);
        return true;
    }

    /* HELPER METHODS */

    private void stopDriver(DriverConnector driverConnector, String oldDriverId) {
    	if(driverConnector == DriverConnector.MQTT) {
    		mqttUtil.stop(oldDriverId);
    	}
    }
    private void startDriver(DriverConnector driverConnector, String driverId, DataDriver driver) {
    	if(driverConnector == DriverConnector.MQTT) {
    		mqttUtil.start(driverId, driver);
    	}
    }

}
