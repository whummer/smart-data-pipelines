package io.riots.services;

import io.riots.services.scenario.PropertyValue;
import io.riots.services.sim.PropertySimulation;
import io.riots.services.sim.Simulation;
import io.riots.services.sim.SimulationRun;
import io.riots.services.sim.TimelineValues;
import io.riots.services.sim.TrafficTraces;

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

import org.springframework.stereotype.Service;

import com.wordnik.swagger.annotations.Api;
import com.wordnik.swagger.annotations.ApiOperation;
import com.wordnik.swagger.annotations.ApiResponse;
import com.wordnik.swagger.annotations.ApiResponses;

/**
 * Service for simulations API.
 * @author Waldemar Hummer
 */
@Service
@Api(value = "Simulations", description = "API for simulations")
public interface SimulationService {

    /* SIMULATIONS */

    @GET
    @Path("/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Retrieve a simulation",
            notes = "Retrieve simulation by its ID.",
            response = Simulation.class)
    @ApiResponses(value = {@ApiResponse(code = 404, message = "No simulation with given ID found")})
    public Simulation retrieve(@PathParam("id") String id);

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
    public List<Simulation> listSimulations(@QueryParam("page") int page, @QueryParam("size") int size);

    @POST
    @Path("/")
    @Consumes({MediaType.APPLICATION_JSON})
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Created a new simulation.",
            notes = "Create a new simulation scenario."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 400, message = "Malformed Simulation provided. See error message for details")
    })
    public Simulation create(Simulation item);

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
    public boolean update(Simulation item);

    @DELETE
    @Path("/{id}")
    @Produces({MediaType.APPLICATION_JSON})
    @ApiOperation(value = "Delete a Simulation",
            notes = "Delete an existing Simulation by its ID. Upon success, HTTP 200 is returned."
    )
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "No such Simulation")
    })
    public boolean deleteSimulation(@PathParam("id") String itemId);

    /* DATA/CURVE GENERATORS*/

    @POST
    @Path("/curve")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Generate curve",
            notes = "Generate a property simulation curve.",
            response = PropertySimulation.class)
    public TimelineValues<PropertyValue> generateCurve(PropertySimulation<?> r);

    @POST
    @Path("/gen/traffic")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Generate vehicle traffic traces.",
            notes = "Generate traces of paths with GPS locations, based on "
            		+ "realistic traffic simulations for a given area "
            		+ "(GPS coordinates of the center location plus vicinity from the center).",
            response = TrafficTraces.class)
    public TrafficTraces generateCurve(int numVehicles, double lat, double lon, double vicinity);

    /* SIMULATION EXECUTION CONTROL */
    
    @POST
    @Path("/exec")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    @ApiOperation(value = "Start simulation.",
            notes = "Start the execution of a simulation. "
            		+ "Creates and returns a corresponding SimulationRun object.",
            response = SimulationRun.class)
    public SimulationRun startSimulation(Simulation simulation);

    /* PROPERTY SIMULATIONS */
    
    //TODO remove?

//    @GET
//    @Path("/{simulationId}/properties")
//    @Produces(MediaType.APPLICATION_JSON)
//    @ApiOperation(value = "Retrieve all property simulations",
//            notes = "Retrieve all property simulations including associated details.",
//            response = PropertySimulation.class)
//    @ApiResponses(value = {
//            @ApiResponse(code = 404, message = "No entity with given ID found"),
//            @ApiResponse(code = 400, message = "Paging parameters are malformed")
//    })
//    @Timed
//    @ExceptionMetered
//    public List<PropertySimulation<?>> listPropertySimulations(
//    		@PathParam("simulationId") String simulationId,
//    		@QueryParam("page") int page,
//    		@QueryParam("size") int size);
//
//    @GET
//    @Path("/properties/{id}")
//    @Produces(MediaType.APPLICATION_JSON)
//    @ApiOperation(value = "Retrieve a single property simulation",
//            notes = "Retrieve a property simulation given its ID.",
//            response = PropertySimulation.class)
//    @ApiResponses(value = {
//            @ApiResponse(code = 404, message = "No entity with given ID found")
//    })
//    @Timed
//    @ExceptionMetered
//    public PropertySimulation<?> getPropertySimulation(@PathParam("id") String propSimId);
//
//    @POST
//    @Path("/{simulationId}/properties")
//    @Consumes({MediaType.APPLICATION_JSON})
//    @Produces({MediaType.APPLICATION_JSON})
//    @ApiOperation(value = "Created a new property simulation.",
//            notes = "Create a new sequence of simulation data for a property."
//    )
//    @ApiResponses(value = {
//            @ApiResponse(code = 400, message = "Malformed PropertySimulation provided. See error message for details")
//    })
//    @Timed
//    @ExceptionMetered
//    public PropertySimulation<?> create(
//    		@PathParam("simulationId") String simulationId, 
//    		PropertySimulation<?> item);
//
//    @PUT
//    @Path("/properties")
//    @Consumes({MediaType.APPLICATION_JSON})
//    @Produces({MediaType.APPLICATION_JSON})
//    @ApiOperation(value = "Update a property simulation.",
//            notes = "Update the sequence of simulation data for a property."
//    )
//    @ApiResponses(value = {
//            @ApiResponse(code = 400, message = "Malformed PropertySimulation provided. See error message for details")
//    })
//    @Timed
//    @ExceptionMetered
//    public boolean update(PropertySimulation<?> item) ;
//
//    @DELETE
//    @Path("/properties/{id}")
//    @Produces({MediaType.APPLICATION_JSON})
//    @ApiOperation(value = "Delete a PropertySimulation",
//            notes = "Delete an existing PropertySimulation by its ID. Upon success, HTTP 200 is returned."
//    )
//    @ApiResponses(value = {
//            @ApiResponse(code = 404, message = "No such PropertySimulation")
//    })
//    @Timed
//    @ExceptionMetered
//    public boolean deletePropertySimulation(@PathParam("id") String itemId);

}