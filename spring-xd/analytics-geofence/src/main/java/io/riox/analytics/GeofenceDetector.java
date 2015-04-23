package io.riox.analytics;

import org.springframework.xd.rxjava.Processor;
import org.springframework.xd.tuple.Tuple;

import rx.Observable;
/**
 * Implements <i>geo fence checking</i> as described
 * <a href="http://whatis.techtarget.com/definition/geofencing">here</a>.
 * 
 * For the circular geo-fence we use the <a href="http://en.wikipedia.org/wiki/Haversine_formula">Haversine formula</a>.
 * 
 * @author riox
 */
public class GeofenceDetector implements Processor<Tuple, Tuple> {

	public static final String KEY = "inside-geofence";

	private Geofence geofence;

	private String[] latPath;

	private String[] longPath;

	/**
	 * Creates a GeofenceDetector
	 * @param latitude the latitude of the geo-fence
	 * @param longitude the longitude of the geo-fence
	 * @param radius the radius of the geo-fence
	 * @param latPath the path expression to extract the actual latitude from the stream
	 * @param longPath the path expression to extract the actual longitude from the stream
	 */
	public GeofenceDetector(double latitude, double longitude, float radius,
			String latPath, String longPath) {	
		geofence = new CircularGeofence(latitude, longitude, radius);		
		this.latPath = latPath.split("\\.");
		this.longPath = longPath.split("\\.");		
	}

	@Override
	public Observable<Tuple> process(Observable<Tuple> inputStream) {
		return inputStream
				.lift(new GeofenceMatchingOperator(
					geofence, latPath, longPath
				));
	}
	
	
	/**
	 * Extracts the given data item path from the tuple. 
	 * @param t the tuple where the data is extracted from
	 * @param path the path, in dot notation, to the data item (x.y.z where z is assumed to be a double).
	 * @return the double number retrieved via the <code>path</code> or NaN is the path is invalid.
	 */
	protected static Double extractDataItem(Tuple t, String[] path) {	
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
