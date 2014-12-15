package io.riots.api.services;

import io.riots.api.handlers.query.DeviceQuery;
import io.riots.api.services.jms.EventBroker;
import io.riots.api.util.JSONUtil;
import io.riots.core.model.Device;
import io.riots.core.model.Property;
import io.riots.core.model.PropertyValue;
import io.riots.core.repositories.PropertyRepository;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.core.repositories.UserRepository;

import java.util.List;

import javax.jms.JMSException;
import javax.jms.TextMessage;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * @author whummer
 */
@Service
@Path("/devices")
@Api(value = "Device Data", description = "Post and retrieve device data.")
public class DeviceData {

    @Autowired
    DeviceQuery deviceQuery;
    @Autowired
    PropertyRepository propRepo;
    @Autowired
    PropertyValueRepository propValueRepo;

	@Autowired
	UserRepository userRepo;
    @Autowired
    HttpServletRequest req;

	@Autowired
    JmsTemplate template;

	/**
	 * This message is called each time we retrieve a status change 
	 * generated in any of the currently running simulations.
	 */
	@JmsListener(destination = EventBroker.MQ_PROP_SIM_UPDATE)
	public void processSimulationUpdate(Object data) {
		PropertyValue<?> prop = null;
		if(data instanceof String) {
			prop = JSONUtil.fromJSON((String)data, PropertyValue.class);
		} else if(data instanceof TextMessage) {
			try {
				prop = JSONUtil.fromJSON(((TextMessage)data).getText(), PropertyValue.class);
			} catch (JMSException e) {
				throw new RuntimeException(e);
			}
		} else if(data instanceof PropertyValue<?>) {
			prop = (PropertyValue<?>)data;
		} else {
			throw new IllegalArgumentException("Unknown update type: " + data);
		}
		postValue(prop);
	}

    @GET
    @Path("/{deviceID}/{propertyName}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve device property value",
            notes = "Retrieve the last data of a given device property",
            response = PropertyValue.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(
    		@PathParam("deviceID") String deviceId,
    		@PathParam("propertyName") String propertyName) {
    	List<PropertyValue<?>> values = retrieveValues(deviceId, propertyName, 1);
    	PropertyValue<?> value = null;
    	if(!values.isEmpty()) {
    		value = values.get(0);
    	}
    	return Response.ok(value).build();
    }

    @GET
    @Path("/{deviceID}/{propertyName}/history")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve device property values",
            notes = "Retrieve a history of the last X (amount) data items of a given device property",
            response = PropertyValue.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No device with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(
    		@PathParam("deviceID") String deviceId,
    		@PathParam("propertyName") String propertyName,
    		@QueryParam("amount") int amount) {
    	List<PropertyValue<?>> values = retrieveValues(deviceId, propertyName, amount);
    	return Response.ok(values).build();
    }

    @POST
    @Path("/{deviceID}/{propertyName}")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Post a device data entry.",
            notes = "Post a device data entry."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed device data provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    @SuppressWarnings("all")
	public Response postValue(@PathParam("deviceID") String deviceId,
    		@PathParam("propertyName") String propertyName, 
    		PropertyValue<?> propValue) {
    	Device dev = deviceQuery.single(deviceId);
    	Property property = dev.getDeviceType().getDeviceProperty(propertyName);
    	propValue.setProperty(property);
    	return postValue(property.getId(), propValue);
    }

    @POST
    @Path("/properties/{propertyID}")
    @Consumes({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Post a device data entry.",
            notes = "Post a device data entry."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed device data provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    @SuppressWarnings("all")
	public Response postValue(@PathParam("propertyID") String propertyID,
    		PropertyValue<?> propValue) {
    	Property property = propRepo.findOne(propertyID);
    	propValue.setProperty(property);
    	return postValue(propValue);
    }

    /* HELPER METHODS */

    private List<PropertyValue<?>> retrieveValues(String deviceId, String propertyName, int amount) {
    	Device dev = deviceQuery.single(deviceId);
    	Property<?> prop = dev.getDeviceType().getDeviceProperty(propertyName);
    	List<PropertyValue<?>> values = propValueRepo.findByProperty(prop, 
    			new PageRequest(1, amount, new Sort(Direction.DESC, "timestamp"))).getContent();
    	return values;
    }

	private Response postValue(PropertyValue<?> propValue) {
		if(propValue.getTimestamp() <= 0) {
			propValue.setTimestamp(System.currentTimeMillis());
		}
    	propValue = propValueRepo.save(propValue);
    	Response r = Response.created(UriBuilder.fromPath(
        		"/devices/properties/{valueID}").build(propValue.getId())).build();
    	EventBroker.sendMessage(EventBroker.MQ_PROP_CHANGE_NOTIFY, template, propValue);
        return r;
	}
}
