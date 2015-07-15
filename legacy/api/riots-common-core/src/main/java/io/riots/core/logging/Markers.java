package io.riots.core.logging;

import org.slf4j.Marker;
import org.slf4j.MarkerFactory;

/**
 * @author omoser
 */
public final class Markers {
    public static final Marker API = MarkerFactory.getMarker("API");
    public static final Marker QUERY = MarkerFactory.getMarker("QUERY");
    public static final Marker COMMAND = MarkerFactory.getMarker("COMMAND");
    public static final Marker CORE = MarkerFactory.getMarker("CORE");
    public static final Marker AUTH = MarkerFactory.getMarker("AUTH");
}
