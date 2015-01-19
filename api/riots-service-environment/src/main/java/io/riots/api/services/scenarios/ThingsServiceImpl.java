package io.riots.api.services.scenarios;

import io.riots.core.handlers.command.ThingCommand;
import io.riots.core.handlers.query.ThingQuery;
import io.riots.core.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.model.ThingMongo;
import io.riots.api.services.scenarios.ThingsService;
import io.riots.api.services.applications.Application;
import io.riots.api.services.scenarios.Thing;
import io.riots.api.services.users.User;

import java.net.URI;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;

/**
 * @author omoser
 * @author whummer
 */
@Service
@Api(value = "Things", description = "Various operations for Things. "
		+ "Things are virtual representations of physical devices, "
		+ "such as sensors, actuators or appliances. Each Thing has "
		+ "a specific ThingType that has to be created using the "
		+ "Catalog service before the Thing can be created")
public class ThingsServiceImpl implements ThingsService {

    @Autowired
    ThingCommand thingCommand;
    @Autowired
    ThingQuery thingQuery;

    @Autowired
    HttpServletRequest req;
    @Context
    MessageContext context;
    @Autowired
    AuthHeaders authHeaders;

    @Autowired
    ServiceClientFactory clientFactory;

    @Override
    @Timed @ExceptionMetered
    public Thing retrieve(String thingId) {
        return thingQuery.single(thingId);
    }

    @Override
    @Timed @ExceptionMetered
    public List<Thing> list() {
    	User user = ServiceUtil.assertValidUser(authHeaders, req);
    	List<Thing> result = thingQuery.queryForUser(user.getId());
    	return result;
    }

    @Override
    @Timed @ExceptionMetered
    public Thing create(Thing thing) {
    	User user = ServiceUtil.assertValidUser(authHeaders, req);
    	thing.setCreatorId(user.getId());
    	thing.setCreated(new Date());
    	ThingMongo m = ThingMongo.convert(thing);
        thing = thingCommand.create(m);
        URI location = ServiceUtil.getPath(context,
        		String.format("../things/%s", thing.getId()));
        ServiceUtil.setLocationHeader(context, location);
        return thing;
    }

    @Override
    @Timed @ExceptionMetered
    public Thing update(Thing thing) {
    	ThingMongo m = ThingMongo.convert(thing);
    	thing = thingCommand.update(m);
        return thing;
    }

    @Override
    @Timed @ExceptionMetered
    public boolean delete(String id) {
        thingCommand.delete(id);
        return true;
    }

    @Override
    @Timed @ExceptionMetered
    public long countThings() {
    	return thingQuery.count();
    }

    @Override
    @Timed @ExceptionMetered
    public List<Thing> retrieveThingsForUser(String userId) {
    	return thingQuery.queryForUser(userId);
    }

    @Override
    @Timed @ExceptionMetered
    public long countThingsForUser(String userId) {
    	return thingQuery.countByCreatorId(userId);
    }
    
    @Override
    @Timed @ExceptionMetered
    public List<Thing> retrieveThingsForApplication(String appId) {
    	Application app = clientFactory.getApplicationsServiceClient().retrieve(appId);
    	List<Thing> result = thingQuery.queryByIds(app.getThings());
    	return result;
    }

}
