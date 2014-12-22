package io.riots.api.services;

import io.hummer.osm.model.Point.PathPoint;
import io.riots.api.handlers.command.PropertySimulationCommand;
import io.riots.api.handlers.command.SimulationCommand;
import io.riots.api.handlers.query.Paged;
import io.riots.api.handlers.query.PropertySimulationQuery;
import io.riots.api.handlers.query.SimulationQuery;
import io.riots.core.model.sim.PropertySimulation;
import io.riots.core.model.sim.PropertySimulationGPS;
import io.riots.core.model.sim.Simulation;
import io.riots.core.model.sim.SimulationRun;
import io.riots.core.model.sim.Time;
import io.riots.core.model.sim.TimelineValues.TimedValue;
import io.riots.core.sim.SimulationManager;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim.TrafficTraces;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim.TrafficTraces.TrafficTrace;
import io.riots.services.model.Location;
import io.riots.services.scenario.PropertyValue;

import java.net.URI;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * @author Waldemar Hummer
 */
@Service
@Path("/simulations")
@Api(value = "Simulations", description = "API for simulations")
public class Simulations {

    @Autowired
    SimulationQuery simulationQuery;
    @Autowired
    PropertySimulationQuery propSimQuery;

    @Autowired
    SimulationCommand simulationCommand;
    @Autowired
    PropertySimulationCommand propSimCommand;

    SimulationManager manager = new SimulationManager();

    private static final Logger LOG = Logger.getLogger(Simulations.class);

    /* SIMULATIONS */

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve a simulation",
            notes = "Retrieve simulation by its ID.",
            response = Simulation.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No simulation with given ID found")})
    @Timed
    @ExceptionMetered
    public Response retrieve(@PathParam("id") String id) {
        return Response.ok(simulationQuery.single(id)).build();
    }

    @GET
    @Path("/")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all Simulations",
            notes = "Retrieve all Simulations including associated details.",
            response = Simulation.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No entity with given ID found"),
            @ApiResponse(code = 400, message = "Paging parameters are malformed")
    })
    @Timed
    @ExceptionMetered
    public Response listSimulations(@QueryParam("page") int page, @QueryParam("size") int size) {
        return Response.ok(simulationQuery.query(new Paged(page, size))).build();
    }

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.TEXT_PLAIN})
    @ApiOperation(value = "Created a new simulation.",
            notes = "Create a new simulation scenario."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Simulation provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response create(Simulation item) {
        item = simulationCommand.create(item);
        URI location = UriBuilder.fromPath("/simulations/{id}").build(item.getId());
        return Response.created(location).build();
    }

    @PUT
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update a simulation.",
            notes = "Update the details of a simulation scenario."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Simulation provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response update(Simulation item) {
    	System.out.println("Updating item: " + item);
        item = simulationCommand.update(item);
		return Response.ok().build();
    }

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a Simulation",
            notes = "Delete an existing Simulation by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such Simulation")
    })
    @Timed
    @ExceptionMetered
    public Response deleteSimulation(@PathParam("id") String itemId) {
        simulationCommand.delete(itemId);
        return Response.ok().build();
    }

    /* PROPERTY SIMULATIONS */

    @GET
    @Path("/properties")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve all property simulations",
            notes = "Retrieve all property simulations including associated details.",
            response = PropertySimulation.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No entity with given ID found"),
            @ApiResponse(code = 400, message = "Paging parameters are malformed")
    })
    @Timed
    @ExceptionMetered
    public Response listPropertySimulations(@QueryParam("page") int page, @QueryParam("size") int size) {
    	List<PropertySimulation<?>> result = propSimQuery.query(new Paged(page, size));
    	return Response.ok(result).build();
    }

    @GET
    @Path("/properties/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve a single property simulation",
            notes = "Retrieve a property simulation given its ID.",
            response = PropertySimulation.class)
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No entity with given ID found")
    })
    @Timed
    @ExceptionMetered
    public Response getPropertySimulation(@PathParam("id") String propSimId) {
    	PropertySimulation<?> result = propSimQuery.single(propSimId);
    	return Response.ok(result).build();
    }

    @POST
    @Path("/properties")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new property simulation.",
            notes = "Create a new sequence of simulation data for a property."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed PropertySimulation provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response create(PropertySimulation<?> item) {
        item = propSimCommand.create(item);
        URI location = UriBuilder.fromPath("/simulations/properties/{id}").build(item.getId());
        System.out.println("Created propSim: " + location);
        return Response.created(location).build();
    }

    @PUT
    @Path("/properties")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Update a property simulation.",
            notes = "Update the sequence of simulation data for a property."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed PropertySimulation provided. See error message for details")
    })
    @Timed
    @ExceptionMetered
    public Response update(PropertySimulation<?> item) {
    	System.out.println("Updating item: " + item);
        item = propSimCommand.update(item);
		return Response.ok().build();
    }

    @DELETE
    @Path("/properties/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a PropertySimulation",
            notes = "Delete an existing PropertySimulation by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such PropertySimulation")
    })
    @Timed
    @ExceptionMetered
    public Response deletePropertySimulation(@PathParam("id") String itemId) {
        propSimCommand.delete(itemId);
        return Response.ok().build();
    }

    /* DATA/CURVE GENERATORS*/

    @POST
    @Path("/curve")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Generate curve",
            notes = "Generate a property simulation curve.",
            response = PropertySimulation.class)
    @Timed @ExceptionMetered
    public Response generateCurve(PropertySimulation<?> r) {
    	if(r instanceof PropertySimulationGPS) {
    		try {
    			PropertySimulationGPS gps = (PropertySimulationGPS)r;
    			// 0.01 is the coordinate difference of two objects one km apart (apprx.)
    			double vicinity = gps.getDiameter() * 0.01;
    			TrafficTraces traces = TrafficSimulatorMatsim.generateTraces(
    					1, gps.getLatitude(), gps.getLongitude(), vicinity);
    			TrafficTrace t = traces.traces.get(0);
    			for(PathPoint p : t.points) {
    				PropertyValue<Location> prop = new PropertyValue<>(new Location(p.y, p.x));
    				gps.getValues().add(new TimedValue<PropertyValue<Location>>(new Time(p.time), prop));
    			}
    		} catch (Exception e) {
    			throw new RuntimeException(e);
    		}
    		((PropertySimulationGPS) r).generateValues();
    	}
    	return Response.ok(r.getValues(new Time(r.startTime), 
        		new Time(r.endTime), null)).build();
    }

    @POST
    @Path("/gen/traffic")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Generate vehicle traffic traces.",
            notes = "Generate traces of paths with GPS locations, based on "
            		+ "realistic traffic simulations for a given area "
            		+ "(GPS coordinates of the center location plus vicinity from the center).",
            response = TrafficTraces.class)
    @Timed @ExceptionMetered
    public Response generateCurve(int numVehicles, double lat, double lon, double vicinity) {
		try {
			TrafficTraces t = TrafficSimulatorMatsim.generateTraces(numVehicles, lat, lon, vicinity);
	    	return Response.ok(t).build();
		} catch (Exception e) {
			LOG.warn(e);
			return Response.serverError().build();
		}
    }

    /* SIMULATION EXECUTION CONTROL */
    
    @POST
    @Path("/exec")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Start simulation.",
            notes = "Start the execution of a simulation. "
            		+ "Creates and returns a corresponding SimulationRun object.",
            response = SimulationRun.class)
    @Timed @ExceptionMetered
    public Response startSimulation(Simulation simulation) {
    	SimulationRun run = manager.startSimulation(simulation);
    	return Response.ok(run).build();
    }

}
