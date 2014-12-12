package io.riots.core.sim;

import io.hummer.osm.model.Point.PathPoint;

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

	public static void interpolate(List<PathPoint> in, double timeStepSize) {
		interpolate(in, timeStepSize, false);
	}

	public static void interpolate(List<PathPoint> in, double timeStepSize, boolean exact) {
		if(in.size() <= 1)
			return;
		LinearInterpolator inter = new LinearInterpolator();
		//double startTime = in.get(0).time;
		for(int i = 1; i < in.size(); i ++) {
			PathPoint p1 = in.get(i - 1);
			PathPoint p2 = in.get(i);
			if((p2.time - p1.time) < timeStepSize) {
				if(exact) {
					in.remove(i--);
				}
				continue;
			}
			double[] times = new double[] {p1.time, p2.time};
			double[] posX = new double[] {p1.x , p2.x};
			PolynomialSplineFunction funcX = inter.interpolate(times, posX);
			double[] posY = new double[] {p1.y, p2.y};
			PolynomialSplineFunction funcY = inter.interpolate(times, posY);
			for(double t = p1.time + timeStepSize; t < p2.time; t += timeStepSize) {
				PathPoint p = new PathPoint(funcX.value(t), funcY.value(t), t);
				in.add(i++, p);
			}
			if(exact) {
				in.remove(i);
			}
		}
	}
}
