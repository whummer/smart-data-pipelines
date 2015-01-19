package io.riots.core.domain.sim;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import io.riots.core.sim.ValueInterpolation;
import io.riots.api.services.sim.LocationInTime;

import java.util.LinkedList;
import java.util.List;

import org.junit.Test;

public class TestValueInterpolation {

	@Test
	public void testInterpolateGPS() {
		List<LocationInTime> list = new LinkedList<LocationInTime>();
		list.add(new LocationInTime(48.2143918, 16.3620032, 0));
		list.add(new LocationInTime(48.2139711,16.3625036, 1));
		list.add(new LocationInTime(48.2145245,16.3637263, 3));
		list.add(new LocationInTime(48.2145245,16.3637263, 4));
		list.add(new LocationInTime(48.2149889,16.3647523, 10));
		list.add(new LocationInTime(48.2148447,16.3649023, 14));
		list.add(new LocationInTime(48.2140457,16.3657301, 17));
		list.add(new LocationInTime(48.2135346,16.3662471, 18));

		ValueInterpolation.interpolate(list, 1);
		assertEquals(list.size(), 19);
		print(list);
		assertMonotonic(list);
	}

	private void assertMonotonic(List<LocationInTime> list) {
		for(int i = 0; i < list.size() - 1; i ++) {
			assertTrue(list.get(i + 1).getTime() > list.get(i).getTime());
		}
	}

	private void print(List<LocationInTime> list) {
		for(LocationInTime p : list) {
			System.out.println(p);
		}
	}

}
