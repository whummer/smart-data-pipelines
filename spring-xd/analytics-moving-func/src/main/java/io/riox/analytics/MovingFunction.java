package io.riox.analytics;

import static org.springframework.xd.tuple.TupleBuilder.tuple;

import org.springframework.xd.rxjava.Processor;
import org.springframework.xd.tuple.Tuple;

import rx.Observable;
import rx.functions.Func1;
import rx.observables.MathObservable;

/**
 * Implements a set of basic <i>moving functions<i> such as moving average,
 * moving sum, min and max. See here for details on the moving average:
 * <a href="http://en.wikipedia.org/wiki/Moving_average">here</a> 
 * 
 * @author riox
 */
public class MovingFunction implements Processor<Tuple, Tuple> {

	public static final String KEY = "moving_function";

	enum Function { MAX, MIN, SUM, AVG };

	private int items = 10;
	private String[] pathElements;
	private Function function;

	public MovingFunction(int items, String itemPath, String function) {
		this.items = items;
		this.pathElements = itemPath.split("\\.");
		this.function = Function.valueOf(function);
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

										if (function == Function.MIN)
											return MathObservable.min(window);
										else if (function == Function.MAX)
											return MathObservable.max(window);
										else if (function == Function.AVG)
											return MathObservable.averageDouble(window);
										else if (function == Function.SUM) {
											return MathObservable.sumDouble(window);
										} else
											throw new IllegalArgumentException("function '" + function + "' not available.");
									}
								}
				)
				.map(tuple -> tuple().of(KEY, tuple));
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
