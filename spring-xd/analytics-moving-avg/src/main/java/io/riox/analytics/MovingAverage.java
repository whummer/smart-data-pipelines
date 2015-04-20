package io.riox.analytics;

import static org.springframework.xd.tuple.TupleBuilder.tuple;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.xd.rxjava.Processor;
import org.springframework.xd.tuple.Tuple;

import rx.Observable;
import rx.functions.Func1;
import rx.observables.MathObservable;

/**
 * Implements a <i>moving average<i> as defined
 * <a href="http://en.wikipedia.org/wiki/Moving_average">here</a> 
 * 
 * @author riox
 */
public class MovingAverage implements Processor<Tuple, Tuple> {

	public static final String KEY = "moving_avg";

	private int items = 10;

	public MovingAverage(int items) {
		this.items = items;
	}

	@Override
	public Observable<Tuple> process(Observable<Tuple> inputStream) {

		return inputStream.map(
				tuple ->  {
					return tuple.getDouble("measurement");
				})				
				.window(items)				
				.flatMap(						
			        new Func1<Observable<Double>, Observable<Double>>() {
			            public Observable<Double> call(Observable<Double> window) {
			                return MathObservable.averageDouble(window);
			            }
			        }
				)
				.map( tuple -> tuple().of(KEY, tuple) );				
	}

}
