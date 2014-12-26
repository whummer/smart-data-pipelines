package io.riots.api.services;

import io.riots.api.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.repositories.DeviceDriverRepository;
import io.riots.core.service.DriversService;
import io.riots.services.drivers.DataDriver;
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
    public DataDriver create(DataDriver driver) {
    	User user = authFilter.getRequestingUser(req);
    	driver.setCreatorId(user.getId());
        driver = driverRepo.save(driver);
        URI uri = UriBuilder.fromPath("/drivers/{id}").build(driver.getId());
        ServiceUtil.setLocationHeader(context, uri);
        return driver;
    }

    @Override
    public DataDriver update(DataDriver driver) {
    	driver = driverRepo.save(driver);
        return driver;
    }

    @Override
    public boolean delete(String itemId) {
        driverRepo.delete(itemId);
        return true;
    }

}
