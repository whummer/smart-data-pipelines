package io.riots.api.services;

import io.riots.api.handlers.command.ThingCommand;
import io.riots.api.handlers.query.Paged;
import io.riots.api.handlers.query.ThingQuery;
import io.riots.api.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.model.ThingMongo;
import io.riots.services.ThingsService;
import io.riots.services.scenario.Thing;

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

    @Override
    @Timed @ExceptionMetered
    public Thing retrieve(String thingId) {
        return thingQuery.single(thingId);
    }

    @Override
    @Timed @ExceptionMetered
    public List<Thing> list(String query, int page, int size) {
    	List<ThingMongo> list = thingQuery.query(query, new Paged(page, size));
    	List<Thing> result = ThingMongo.convert(list);
    	return result;
    }

    @Override
    @Timed @ExceptionMetered
    public Thing create(Thing thing) {
    	thing.setCreatorId(authHeaders.getRequestingUser(req).getId());
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
    public boolean delete(String thingId) {
        thingCommand.delete(thingId);
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

}
