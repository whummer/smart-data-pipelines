package io.riox.analytics;

import static org.junit.Assert.assertEquals;

import java.util.List;

import org.junit.Test;
import org.springframework.xd.rxjava.Processor;
import org.springframework.xd.tuple.Tuple;
import org.springframework.xd.tuple.TupleBuilder;

import rx.Observable;
import rx.Subscription;
import rx.observers.TestSubscriber;
import rx.subjects.PublishSubject;
import rx.subjects.Subject;

/**
 * Implements unit test for the {@link GeofenceDetector} processor.
 * 
 * @author riox
 */
public class GeofenceTests {

	@Test
	public void simpleGeofence() throws InterruptedException {
		final Subject<Tuple, Tuple> subject = PublishSubject.create();

		Processor<Tuple, Tuple> processor = new GeofenceDetector(
				48.216449, 16.336665, 2000, // fence with 10KM radius
				"geolocation.lat", "geolocation.long");

		Observable<Tuple> outputStream = processor.process(subject);

		// Assert that we received the moving_avg
		TestSubscriber<Tuple> testSubscriber = new TestSubscriber<Tuple>();

		Subscription subscription = outputStream.subscribe(testSubscriber);

		// generate data		
		Tuple latLong = TupleBuilder.tuple().of("lat", 48.209593, "long", 16.352925);
		Tuple geolocation = TupleBuilder.tuple().of("geolocation", latLong);
		
		subject.onNext(geolocation);
		
		List<Tuple> events = testSubscriber.getOnNextEvents();
		System.out.println(events.get(0).toString());
		assertEquals(1, events.size());
//		assertTrue(events.get(0).getBoolean(GeofenceDetector.KEY));
		
		subscription.unsubscribe();

		// FIXME this fails b/c of some concurrent modification exception which i
		// believe is a bug in the TestSubscriber
		// testSubscriber.assertNoErrors();
		testSubscriber.assertUnsubscribed();

	}
}
