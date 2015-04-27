package io.riox.analytics;

import static org.springframework.xd.tuple.TupleBuilder.tuple;

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

	public static final String KEY = "moving_average";

	private int items = 10;
	private String[] pathElements;

	public MovingAverage(int items, String itemPath) {
		this.items = items;
		this.pathElements = itemPath.split("\\.");
	}

	@Override
	public Observable<Tuple> process(Observable<Tuple> inputStream) {
		return inputStream
				.map(
					tuple ->  { return extractDataItem(tuple, pathElements); }
				)				
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
	
	/**
	 * Extracts the given data item path from the tuple. 
	 * @param t the tuple where the data is extracted from
	 * @param path the path, in dot notation, to the data item (x.y.z where z is assumed to be a double).
	 * @return the double number retrieved via the <code>path</code> or NaN is the path is invalid.
	 */
	private Double extractDataItem(Tuple t, String[] path) {	
		for (int i = 0; i < path.length - 1; i++) {
			if (t != null) {
				try {
					t = t.getTuple(path[i]);				
				} catch (Throwable th) {
					// ignore - Spring throws an ArrayIndexOutOfBoundsException if the path does not exist
				}
			}
		}	
		if (t == null) {
			return Double.NaN;
		}
		return t.getDouble(path[ path.length-1 ], Double.NaN); 		
	}

}
