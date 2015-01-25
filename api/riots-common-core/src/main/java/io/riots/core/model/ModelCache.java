package io.riots.core.model;

import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import com.google.common.cache.CacheBuilder;

/**
 * Provides caches for different model entities.
 * Implementation is based on Google Guava utils.
 * @author whummer
 */
public class ModelCache {

	private static int DEFAULT_TIMEOUT_MINUTES = 2;
	private static int DEFAULT_MAX_SIZE = 100;

	/**
	 * Cache for thing types.
	 */
	public static final ConcurrentMap<Object,Object> THINGTYPES = 
			CacheBuilder.newBuilder()
		    .maximumSize(DEFAULT_MAX_SIZE)
		    .expireAfterWrite(DEFAULT_TIMEOUT_MINUTES, TimeUnit.MINUTES)
		    .build().asMap();

	/**
	 * Cache for things.
	 */
	public static final ConcurrentMap<Object,Object> THINGS = 
			CacheBuilder.newBuilder()
		    .maximumSize(DEFAULT_MAX_SIZE)
		    .expireAfterWrite(DEFAULT_TIMEOUT_MINUTES, TimeUnit.MINUTES)
		    .build().asMap();

	/**
	 * Cache for users.
	 */
	public static final ConcurrentMap<Object,Object> USERS = 
			CacheBuilder.newBuilder()
		    .maximumSize(DEFAULT_MAX_SIZE)
		    .expireAfterWrite(DEFAULT_TIMEOUT_MINUTES, TimeUnit.MINUTES)
		    .build().asMap();

	/**
	 * Cache for service clients.
	 */
	public static final ConcurrentMap<Object,Object> SERVICE_CLIENTS = 
			CacheBuilder.newBuilder()
		    .maximumSize(DEFAULT_MAX_SIZE)
		    .expireAfterWrite(DEFAULT_TIMEOUT_MINUTES, TimeUnit.MINUTES)
		    .build().asMap();

}
