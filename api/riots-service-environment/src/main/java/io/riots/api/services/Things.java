package io.riots.api.services;

import io.riots.api.handlers.command.ThingCommand;
import io.riots.api.handlers.query.Paged;
import io.riots.api.handlers.query.ThingQuery;
import io.riots.core.auth.AuthFilter;
import io.riots.core.service.IThings;
import io.riots.model.ThingMongo;
import io.riots.services.scenario.Thing;

import java.net.URI;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Path;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.UriBuilder;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;

/**
 * @author omoser
 * @author whummer
 */
@Service
@Path("/things")
@Api(value = "Things", description = "CRUD operations for Things. Things are virtual representations of physical " +
        "devices, such as sensors, actuators or appliances. Each Thing has a specific ThingType that has to be " +
        "created using the ThingTypes service before the Thing can be created")
public class Things implements IThings {

    @Autowired
    ThingQuery thingQuery;

    @Autowired
    ThingCommand thingCommand;

    @Autowired
    HttpServletRequest req;

    @Context
    MessageContext context;

    @Autowired
    AuthFilter authFilter;

    @Override
    public Thing retrieve(String thingId) {
        return thingQuery.single(thingId);
    }

    @Override
    public List<Thing> list(String query, int page, int size) {
    	List<ThingMongo> list = thingQuery.query(query, new Paged(page, size));
    	List<Thing> result = ThingMongo.convert(list);
    	return result;
    }

    @Override
    public Thing create(Thing thing) {
    	thing.setCreatorId(authFilter.getRequestingUser(req).getId());
    	ThingMongo m = ThingMongo.convert(thing);
        thing = thingCommand.create(m);
        URI location = UriBuilder.fromPath("/things/{id}").build(thing.getId());
        context.getHttpServletResponse().addHeader("Location", location.toString());
        return thing;
    }

    @Override
    public Thing update(Thing thing) {
    	ThingMongo m = ThingMongo.convert(thing);
    	thing = thingCommand.update(m);
        return thing;
    }

    @Override
    public boolean delete(String thingId) {
        thingCommand.delete(thingId);
        return true;
    }

}
