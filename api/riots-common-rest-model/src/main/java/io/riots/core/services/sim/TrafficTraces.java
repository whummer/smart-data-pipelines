package io.riots.core.services.sim;

import java.util.LinkedList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TrafficTraces {
	public static class TrafficTrace {
		@JsonProperty
		public String id;
		@JsonProperty
		public List<LocationInTime> points = new LinkedList<>();
		@Override
		public String toString() {
			return "TrafficTrace [id=" + id + ", points=" + points + "]";
		}
	}
	@JsonProperty
	public List<TrafficTrace> traces = new LinkedList<>();
}