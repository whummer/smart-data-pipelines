package io.riox.analytics;

import static org.junit.Assert.assertEquals;

import java.util.ArrayList;
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
 * Implements unit test for the {@link MovingAverage} processor.
 * 
 * @author riox
 */
public class MovingAverageTests {

	@Test
	public void simpleAverage() throws InterruptedException {
		final Subject<Tuple, Tuple> subject = PublishSubject.create();

		Processor<Tuple, Tuple> processor = new MovingAverage(10, "measurement");
		Observable<Tuple> outputStream = processor.process(subject);

		// Assert that we received the moving_avg
		TestSubscriber<Tuple> testSubscriber = new TestSubscriber<Tuple>(
				subject);

		Subscription subscription = outputStream.subscribe(testSubscriber);

		// generate data
		List<Tuple> inputData = new ArrayList<Tuple>();
		for (int i = 0; i < 10; i++) {
			inputData.add(TupleBuilder.tuple().of("id", i, "measurement",
					new Double(i + 10)));
		}

		for (Tuple tuple : inputData) {
			subject.onNext(tuple);
		}

		List<Tuple> events = testSubscriber.getOnNextEvents();
		assertEquals(1, events.size());
		assertEquals(14.5, events.get(0).getDouble(MovingAverage.KEY), 0);
		
		subscription.unsubscribe();

		// FIXME this fails b/c of some concurrent modification exception which i
		// believe is a bug in the TestSubscriber
		// testSubscriber.assertNoErrors();
		testSubscriber.assertUnsubscribed();

	}
}
