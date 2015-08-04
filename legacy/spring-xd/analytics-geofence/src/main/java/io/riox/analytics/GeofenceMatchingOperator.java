package io.riox.analytics;

import java.util.List;

import org.springframework.xd.tuple.Tuple;
import org.springframework.xd.tuple.TupleBuilder;

import rx.Observable.Operator;
import rx.Subscriber;

/**
 * Implements a geo-fence matching operator for rxjava.
 * 
 * @author riox
 */
public final class GeofenceMatchingOperator implements Operator<Tuple, Tuple> {

	public static final String GEOFENCE = "geofence";
	public static final String RIOX_ANALYTICS = "riox-analytics";

	private Geofence geofence;
	private String[] latPath;
	private String[] longPath;

	public GeofenceMatchingOperator(Geofence geofence, String[] latPath,
			String[] longPath) {
		this.geofence = geofence;
		this.latPath = latPath;
		this.longPath = longPath;
	}

	@Override
	public Subscriber<? super Tuple> call(Subscriber<? super Tuple> subscriber) {
		return new GeofenceObserver(subscriber);
	}

	/** Computes the average. */
	private final class GeofenceObserver extends Subscriber<Tuple> {

		final Subscriber<? super Tuple> subscriber;
		private boolean match;

		public GeofenceObserver(Subscriber<? super Tuple> subscriber) {
			super(subscriber);
			this.subscriber = subscriber;
		}

		@Override
		public void onNext(Tuple args) {
			if (!subscriber.isUnsubscribed()) {

				match = geofence.match(
						GeofenceDetector.extractDataItem(args, latPath),
						GeofenceDetector.extractDataItem(args, longPath));
				
				// TODO find a better implementation than copying the tuple 
				List<String> names = args.getFieldNames();
				List<Object> values = args.getValues();
				int i = 0;
				TupleBuilder tuple = TupleBuilder.tuple();
				for (String name : names) {				
					tuple.put(name, values.get(i++));
				}
				// add result to tuple
				tuple.put(RIOX_ANALYTICS, TupleBuilder.tuple().of(GEOFENCE, geofence.toTuple(), GeofenceDetector.KEY, match));
				subscriber.onNext(tuple.build());
			}

		}

		@Override
		public void onError(Throwable e) {
			if (!subscriber.isUnsubscribed()) {
				subscriber.onError(e);
			}
		}

		@Override
		public void onCompleted() {
			if (!subscriber.isUnsubscribed()) {
				subscriber.onCompleted();
			}
		}

	}

}