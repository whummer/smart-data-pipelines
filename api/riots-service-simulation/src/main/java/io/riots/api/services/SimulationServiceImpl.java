package io.riots.api.services;

import io.riots.api.handlers.command.PropertySimulationCommand;
import io.riots.api.handlers.command.SimulationCommand;
import io.riots.api.handlers.command.SimulationTypeCommand;
import io.riots.api.handlers.query.Paged;
import io.riots.api.handlers.query.PropertySimulationQuery;
import io.riots.api.handlers.query.SimulationQuery;
import io.riots.api.handlers.query.SimulationTypeQuery;
import io.riots.api.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.sim.PropertyValueGenerator;
import io.riots.core.sim.SimulationManager;
import io.riots.core.sim.traffic.TrafficSimulatorMatsim;
import io.riots.services.SimulationService;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.sim.LocationInTime;
import io.riots.services.sim.PropertySimulation;
import io.riots.services.sim.PropertySimulationGPS;
import io.riots.services.sim.Simulation;
import io.riots.services.sim.SimulationRun;
import io.riots.services.sim.SimulationType;
import io.riots.services.sim.Time;
import io.riots.services.sim.TimelineValues;
import io.riots.services.sim.TimelineValues.TimedValue;
import io.riots.services.sim.TrafficTraces;
import io.riots.services.sim.TrafficTraces.TrafficTrace;

import java.net.URL;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author Waldemar Hummer
 */
@Service
public class SimulationServiceImpl implements SimulationService {

    @Autowired
    SimulationQuery simulationQuery;
    @Autowired
    SimulationTypeQuery simTypeQuery;
    @Autowired
    PropertySimulationQuery propSimQuery;

    @Autowired
    SimulationCommand simulationCommand;
    @Autowired
    SimulationTypeCommand simTypeCommand;
    @Autowired
    PropertySimulationCommand propSimCommand;

    @Autowired
    HttpServletRequest req;
    @Context
    MessageContext context;
    @Autowired
    AuthHeaders authHeaders;

    SimulationManager manager = new SimulationManager();

    private static final Logger LOG = Logger.getLogger(SimulationServiceImpl.class);

    /* SIMULATIONS */

    @Override
    @Timed @ExceptionMetered
    public Simulation retrieve(String id) {
        return simulationQuery.single(id);
    }

    @Override
    @Timed @ExceptionMetered
    public List<Simulation> listSimulations(int page, int size) {
    	List<Simulation> result = simulationQuery.query(new Paged(page, size));
        return result;
    }

    @Override
    @Timed @ExceptionMetered
    public Simulation create(Simulation item) {
    	item.setCreatorId(authHeaders.getRequestingUser(req).getId());
        item = simulationCommand.create(item);
        URL location = ServiceUtil.getHref(String.format("simulations/%s", item.getId()));
        ServiceUtil.setLocationHeader(context, location);
        ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_CREATED);
        return item;
    }

    @Override
    @Timed @ExceptionMetered
    public boolean update(Simulation item) {
        item = simulationCommand.update(item);
		return true;
    }

    @Override
    @Timed @ExceptionMetered
    public boolean deleteSimulation(String itemId) {
        simulationCommand.delete(itemId);
        return true;
    }

    /* SIMULATION TYPES */

	@Override
    @Timed @ExceptionMetered
	public List<SimulationType> listSimTypes(int page, int size) {
    	List<SimulationType> result = simTypeQuery.query(new Paged(page, size));
        return result;
	}

	@Override
    @Timed @ExceptionMetered
	public SimulationType retrieveSimType(String id) {
        return simTypeQuery.single(id);
	}

	@Override
    @Timed @ExceptionMetered
	public SimulationType createSimType(SimulationType item) {
    	item.setCreatorId(authHeaders.getRequestingUser(req).getId());
        item = simTypeCommand.create(item);
        URL location = ServiceUtil.getHref(String.format("simulations/types/%s", item.getId()));
        ServiceUtil.setLocationHeader(context, location);
        ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_CREATED);
        return item;
	}

	@Override
    @Timed @ExceptionMetered
	public boolean updateSimType(SimulationType item) {
        item = simTypeCommand.update(item);
		return true;
	}

	@Override
    @Timed @ExceptionMetered
	public boolean deleteSimType(String itemId) {
        simTypeCommand.delete(itemId);
		return true;
	}

    /* DATA/CURVE GENERATORS*/

    @Override
    @Timed @ExceptionMetered
    public TimelineValues<PropertyValue> generateCurve(PropertySimulation<?> r) {
    	if(r instanceof PropertySimulationGPS) {
    		try {
    			PropertySimulationGPS gps = (PropertySimulationGPS)r;
    			// 0.01 is the coordinate difference of two objects one km apart (apprx.)
    			double vicinity = gps.getDiameter() * 0.01;
    			TrafficTraces traces = TrafficSimulatorMatsim.generateTraces(
    					1, gps.getLatitude(), gps.getLongitude(), vicinity);
    			TrafficTrace t = traces.traces.get(0);
    			for(LocationInTime p : t.points) {
    				PropertyValue prop = new PropertyValue(p.property);
    				gps.getValues().add(new TimedValue<PropertyValue>(p.time, prop));
    			}
    		} catch (Exception e) {
    			throw new RuntimeException(e);
    		}
    		((PropertySimulationGPS) r).generateValues();
    	}
    	
		TimelineValues<PropertyValue> o = PropertyValueGenerator.getValues(r, new Time(r.startTime), 
        		new Time(r.endTime), null);
    	return o;
    }

    @Override
    @Timed @ExceptionMetered
    public TrafficTraces generateCurve(int numVehicles, double lat, double lon, double vicinity) {
		try {
			TrafficTraces t = TrafficSimulatorMatsim.generateTraces(numVehicles, lat, lon, vicinity);
	    	return t;
		} catch (Exception e) {
			LOG.warn(e);
			throw new WebApplicationException(e);
		}
    }

    /* SIMULATION EXECUTION CONTROL */

    @Override
    @Timed @ExceptionMetered
    public SimulationRun startSimulation(Simulation simulation) {
    	SimulationRun run = manager.startSimulation(simulation);
    	return run;
    }

    /* PROPERTY SIMULATIONS */
    // TODO remove?
  
//    @Override
//    public List<PropertySimulation<?>> listPropertySimulations(String simulationId, int page, int size) {
//    	Simulation sim = retrieve(simulationId);
//    	List<PropertySimulation<?>> result = propSimQuery.query(sim);
//    	return result;
//    }
//
//    @Override
//    public PropertySimulation<?> getPropertySimulation(String propSimId) {
//    	PropertySimulation<?> result = propSimQuery.single(propSimId);
//    	return result;
//    }
//
//    @Override
//    public PropertySimulation<?> create(String simulationId, PropertySimulation<?> item) {
//    	Simulation sim = retrieve(simulationId);
//        item = propSimCommand.create(item);
//        sim.getSimulationProperties().add(item.getId());
//        update(sim);
//        URL url = ServiceUtil.getHref(String.format("simulations/properties/%s", item.getId()));
//        ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_CREATED);
//        ServiceUtil.setLocationHeader(context, url);
//        return item;
//    }
//
//    @Override
//    public boolean update(PropertySimulation<?> item) {
//    	item = propSimCommand.update(item);
//		return true;
//    }
//
//    @Override
//    public boolean deletePropertySimulation(String itemId) {
//        propSimCommand.delete(itemId);
//        return true;
//    }

}
