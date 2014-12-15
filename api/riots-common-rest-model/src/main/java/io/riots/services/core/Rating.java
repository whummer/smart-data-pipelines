package io.riots.services.core;

import java.io.Serializable;
import java.util.Collection;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Represents a user rating.
 * 
 * @author Waldemar Hummer
 */
public class Rating implements Serializable {
	private static final long serialVersionUID = 1L;

	
	public String id;
	@JsonProperty
	public String thing;
	public User user;

	@JsonProperty
	public double rating;
	@JsonProperty
	public double min = 1;
	@JsonProperty
	public double max = 5;

	public static class RatingAggregated extends Rating {
		private static final long serialVersionUID = 1L;
		
		public static RatingAggregated construct(Collection<Rating> list) {
			RatingAggregated result = new RatingAggregated();
			double sum = 0;
			double count = list.size();
			double min = Double.MAX_VALUE;
			double max = Double.MIN_VALUE;
			String thing = null;
			for(Rating r : list) {
				double percentage = r.rating / (r.max - r.min + 1);
				sum += percentage;
				if(r.min < min)
					min = r.min;
				if(r.max > max)
					max = r.max;
				if(r.thing != null && thing != null && !r.thing.equals(thing)) {
					throw new RuntimeException("Can only aggregate over ratings of same object: " + r.thing + " - " + thing);
				}
				thing = r.thing;
			}
			result.min = min;
			result.max = max;
			result.rating = min + ((sum / count) * (max - min + 1)) - 1;
			result.thing = thing;
			return result;
		}

	}

}
