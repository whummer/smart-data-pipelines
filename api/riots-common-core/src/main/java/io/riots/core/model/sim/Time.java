package io.riots.core.model.sim;

/**
 * Represents simulation time.
 * @author Waldemar Hummer
 */
public class Time {

	private double time;

	public Time() {}
	public Time(double time) {
		this.time = time;
	}

	public double getTime() {
		return time;
	}

	@Override
	public String toString() {
		return "T(" + time + ")";
	}
}
