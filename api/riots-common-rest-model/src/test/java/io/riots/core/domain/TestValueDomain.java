package io.riots.core.domain;

import static org.testng.Assert.assertEquals;
import io.riots.services.catalog.ValueDomain;
import io.riots.services.catalog.ValueDomainContinuous;
import io.riots.services.catalog.ValueDomainDiscrete;
import io.riots.services.catalog.ValueDomainEnumerated;

import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import org.testng.annotations.Test;

/**
 * Test calculation of ranges and generation/iteration 
 * of values within value domains.
 *
 * @author Waldemar Hummer
 */
public class TestValueDomain {

	@Test
	public void testDomainGeneration() {
		ValueDomain<Double> d1 = new ValueDomainDiscrete<Double>(-30.0, 50.0, 0.1);
		testDomainSize(d1, 800L);

		ValueDomain<Double> d2 = new ValueDomainDiscrete<Double>(-30.0, 50.0, 0.03);
		testDomainSize(d2, 2667L);

		ValueDomain<Double> d3 = new ValueDomainContinuous<Double>(-30.0, 50.0);
		testDomainSize(d3, null);

		Double[] v1 = new Double[]{-30.0, 50.0, 0.1, 31.2, 123124.3, 123123.4};
		ValueDomain<Double> d4 = new ValueDomainEnumerated<Double>(v1);
		testDomainSize(d4, (long)v1.length);

	}

	private <T> void testDomainSize(ValueDomain<T> vd, Long expected) {
		List<T> list = toList(vd.iterateValues());
		Long size = (long)list.size();
		try {
			assertEquals(expected, vd.getDomainSize());
			if(expected != null) {
				assertEquals(vd.getDomainSize(), size);
				assertEquals(expected, size);
			}
		} catch (Error e) {
			System.out.println(list);
			throw e;
		}
	}

	private <T> List<T> toList(Iterator<T> iter) {
		List<T> list = new LinkedList<T>();
		if(iter != null) {
			while(iter.hasNext()) {
				list.add(iter.next());
			}
		}
		return list;
	}
}
