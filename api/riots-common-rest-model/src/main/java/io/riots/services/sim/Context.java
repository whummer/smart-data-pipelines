package io.riots.services.sim;

import java.util.HashMap;
import java.util.Map;

/**
 * Simulation context, which allows some of the more sophisticated
 * simulation behaviors to access context information. For instance, assume we have
 * device properties A and B which should always generate "similar" values. Now, if 
 * values for A are generated in the simulation (e.g., based on a random distribution), 
 * in order to generate the values of B we need to be able to access A's generated
 * values; this can be achieved via the simulation {@link Context}.
 * @author Waldemar Hummer
 */
public class Context {

	/**
	 * The entries which represent the state of this context.
	 */
	private final Map<String, ContextEntry> entries = new HashMap<>();

	public static class ContextEntry {
		private Object value;
		public Object getValue() {
			return value;
		}
	}

	public Map<String, ContextEntry> getEntries() {
		return entries;
	}
}
