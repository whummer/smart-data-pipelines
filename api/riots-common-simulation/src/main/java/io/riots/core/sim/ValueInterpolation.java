package io.riots.core.sim;

import io.riots.services.sim.LocationInTime;
import io.riots.services.sim.Time;

import java.util.List;

import org.apache.commons.math3.analysis.interpolation.LinearInterpolator;
import org.apache.commons.math3.analysis.polynomials.PolynomialSplineFunction;

/**
 * Provide interpolation of different value series.
 *
 * For instance, given a sequence of timestamped GPS location points, and a
 * given time interval of <i>s</i> seconds, fill in additional points to ensure
 * that the trace contains a GPS location after exactly (or at least) every
 * <i>s</i> seconds.
 *
 * @author whummer
 */
public class ValueInterpolation {

	public static void interpolate(List<LocationInTime> in, double timeStepSize) {
		interpolate(in, timeStepSize, false);
	}

	public static void interpolate(List<LocationInTime> in, double timeStepSize, boolean exact) {
		if(in.size() <= 1)
			return;
		LinearInterpolator inter = new LinearInterpolator();
		//double startTime = in.get(0).time;
		for(int i = 1; i < in.size(); i ++) {
			LocationInTime p1 = in.get(i - 1);
			LocationInTime p2 = in.get(i);
			if((p2.getTime() - p1.getTime()) < timeStepSize) {
				if(exact) {
					in.remove(i--);
				}
				continue;
			}
			double[] times = new double[] {p1.getTime(), p2.getTime()};
			double[] posX = new double[] {p1.getX() , p2.getX()};
			PolynomialSplineFunction funcX = inter.interpolate(times, posX);
			double[] posY = new double[] {p1.getY(), p2.getY()};
			PolynomialSplineFunction funcY = inter.interpolate(times, posY);
			for(double t = p1.getTime() + timeStepSize; t < p2.getTime(); t += timeStepSize) {
				LocationInTime p = new LocationInTime();
				p.property.setLatitude(funcY.value(t));
				p.property.setLongitude(funcX.value(t));
				p.time = new Time(t);
				in.add(i++, p);
			}
			if(exact) {
				in.remove(i);
			}
		}
	}
}
