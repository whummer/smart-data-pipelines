package io.riots.core.sim;

import io.riots.api.services.jms.EventBroker;
import io.riots.services.model.Location;
import io.riots.services.scenario.PropertyValue;
import io.riots.services.sim.Context;
import io.riots.services.sim.PropertySimulation;
import io.riots.services.sim.PropertySimulationGPS;
import io.riots.services.sim.Simulation;
import io.riots.services.sim.SimulationRun;
import io.riots.services.sim.Time;

import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ScheduledThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Class to manage currently running simulation instances.
 * 
 * @author whummer
 */
@Component
public class SimulationManager {

	private static final double MIN_INTERVAL_SEC = 0.1;

	/**
	 * Autowired JMS template, used for sending messages.
	 */
	@Autowired
	private EventBroker eventBroker;
	/**
	 * Simulation runners.
	 */
	private List<SimulationRunner> simulationRunners = new CopyOnWriteArrayList<SimulationRunner>();
	/**
	 * Thread pool executor.
	 */
	private ScheduledThreadPoolExecutor executor = new ScheduledThreadPoolExecutor(5);
	/**
	 * List of listeners.
	 */
	private static final Map<String, List<SimulationSubscription>> subscriptions = new ConcurrentHashMap<>();

	public static class SimulationSubscription {
		String subscriptionID;
		String simulationRunID;
		SimulationListener listener;

		public SimulationSubscription(String simulationRunID,
				SimulationListener simulationListener) {
			this.simulationRunID = simulationRunID;
			this.listener = simulationListener;
		}
	}

	private class SimulationRunner implements Runnable {
		SimulationRun run;
		final AtomicBoolean running = new AtomicBoolean(true);
		PropertySimulation<?> propSim;
		double currentTick = 0;
		Context ctx = new Context(); // TODO needed?
		public ScheduledFuture<?> future;

		public SimulationRunner(SimulationRun run, PropertySimulation<?> propSim) {
			this.run = run;
			this.propSim = propSim;
		}

		public void runNextTick() {
			if (!running.get()) {
				terminate();
				return;
			}
			PropertyValue value = PropertyValueGenerator.getValueAt(
					propSim, new Time(currentTick), ctx);
			try {
				eventBroker.sendMessage(EventBroker.MQ_INBOUND_PROP_UPDATE, value);
				if(propSim instanceof PropertySimulationGPS) {
					Location loc = (Location)value.getValue();
					/* additionally, send lat/lng updates */
					PropertyValue vLat = new PropertyValue(
							propSim.getThingId(),
							propSim.getPropertyName() + ".latitude", // TODO whu: hard-coded
							loc.getLatitude(),
							value.getTimestamp()
							);
					PropertyValue vLng = new PropertyValue(
							propSim.getThingId(),
							propSim.getPropertyName() + ".longitude", // TODO whu: hard-coded
							loc.getLongitude(),
							value.getTimestamp()
							);
					eventBroker.sendMessage(EventBroker.MQ_INBOUND_PROP_UPDATE, vLat);
					eventBroker.sendMessage(EventBroker.MQ_INBOUND_PROP_UPDATE, vLng);
				}
			} catch (Throwable e) {
				e.printStackTrace();
			}
			currentTick += propSim.getStepInterval();
		}

		void terminate() {
			running.set(false);
			SimulationManager.this.simulationRunners.remove(this);
			future.cancel(false);
		}

		public void run() {
			runNextTick();
		}
	}

	public SimulationRun startSimulation(Simulation sim) {
		SimulationRun r = new SimulationRun(sim);
		r.setId(UUID.randomUUID().toString());
		for (PropertySimulation<?> propSim : sim.getSimulationProperties()) {
			if (propSim.stepInterval < MIN_INTERVAL_SEC) {
				propSim.stepInterval = MIN_INTERVAL_SEC;
			}
			SimulationRunner runner = new SimulationRunner(r, propSim);
			simulationRunners.add(runner);
			System.out.println("starting runner " + runner + " - " + r + " - " + propSim);
			ScheduledFuture<?> f = executor.scheduleAtFixedRate(runner, 0,
					(int) (propSim.getStepInterval() * 1000.0),
					TimeUnit.MILLISECONDS);
			runner.future = f;
		}
		return r;
	}

	public static SimulationSubscription registerListener(
			String simulationRunID, SimulationListener simulationListener) {
		SimulationSubscription s = new SimulationSubscription(simulationRunID,
				simulationListener);
		s.simulationRunID = simulationRunID;
		s.subscriptionID = UUID.randomUUID().toString();
		synchronized (subscriptions) {
			if (!subscriptions.containsKey(simulationRunID)) {
				subscriptions.put(simulationRunID, new LinkedList<>());
			}
			subscriptions.get(simulationRunID).add(s);
		}
		return s;
	}

	public static void unregisterListener(String simulationRunID,
			SimulationSubscription simulationSubscription) {
		synchronized (subscriptions) {
			if (!subscriptions.containsKey(simulationRunID)) {
				return;
			}
			subscriptions.get(simulationRunID).remove(simulationSubscription);
		}
	}

	public void stopSimulation(String thingId, String propertyName) {
		for (SimulationRunner runner : simulationRunners) {
			Simulation sim = runner.run.getSimulation();
			for (PropertySimulation<?> propSim : sim.getSimulationProperties()) {
				if (propSim != null && 
						propSim.getPropertyName() != null && propSim.getPropertyName().equals(propertyName) &&
						propSim.getThingId() != null && propSim.getThingId().equals(thingId)) {
					/* terminate this sim. runner */
					runner.terminate();
				}
			}
		}
	}

}
