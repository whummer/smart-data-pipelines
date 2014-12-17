package io.riots.core.domain.sim;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import io.hummer.osm.model.Point.PathPoint;
import io.riots.core.sim.ValueInterpolation;

import java.util.LinkedList;
import java.util.List;

import org.junit.Test;

public class TestValueInterpolation {

	@Test
	public void testInterpolateGPS() {
		List<PathPoint> list = new LinkedList<PathPoint>();
		list.add(new PathPoint(16.3620032,48.2143918, 0));
		list.add(new PathPoint(16.3625036,48.2139711, 1));
		list.add(new PathPoint(16.3637263,48.2145245, 3));
		list.add(new PathPoint(16.3637263,48.2145245, 4));
		list.add(new PathPoint(16.3647523,48.2149889, 10));
		list.add(new PathPoint(16.3649023,48.2148447, 14));
		list.add(new PathPoint(16.3657301,48.2140457, 17));
		list.add(new PathPoint(16.3662471,48.2135346, 18));

		ValueInterpolation.interpolate(list, 1);
		assertEquals(list.size(), 19);
		print(list);
		assertMonotonic(list);
	}

	private void assertMonotonic(List<PathPoint> list) {
		for(int i = 0; i < list.size() - 1; i ++) {
			assertTrue(list.get(i + 1).time > list.get(i).time);
		}
	}

	private void print(List<PathPoint> list) {
		for(PathPoint p : list) {
			System.out.println(p);
		}
	}

}
