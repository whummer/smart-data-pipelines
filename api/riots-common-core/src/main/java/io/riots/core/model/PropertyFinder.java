package io.riots.core.model;

import io.riots.core.service.ServiceClientFactory;
import io.riots.services.CatalogService;
import io.riots.services.ThingsService;
import io.riots.services.catalog.HierarchicalObject;
import io.riots.services.catalog.Property;
import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.Thing;

import java.util.Collection;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Class for retrieving {@link Property} information encoded within
 * {@link ThingType} entities (including sub-{@link ThingType}s and sub-
 * {@link Property}s).
 * 
 * @author whummer
 */
@Component
public class PropertyFinder {

	@Autowired
	ServiceClientFactory clientFactory;

	/**
	 * Find a property by name in a list of properties. Properties are
	 * {@link HierarchicalObject}s, hence the name parameter may use a
	 * "dot notation" to access sub-properties, e.g., "parentProp1.subProp1"
	 * 
	 * @param properties
	 * @param name
	 * @return
	 */
	public Property findProperty(Collection<Property> properties, String name) {
		String propName = name;
		String remainder = null;
		if (name.contains(".")) {
			int index = name.indexOf(".");
			propName = name.substring(0, index);
			remainder = name.substring(index + 1);
		}
		for (Property p : properties) {
			// System.out.println("prop name " + propName + " - " + p);
			if (propName.equals(p.getName())) {
				// System.out.println("found property " + p + " - " + propName);
				if (remainder == null) {
					return p;
				} else {
					return findProperty(p.getChildren(), remainder);
				}
			}
		}
		return null;
	}

	/**
	 * Find a property in a ThingType (also recurses into child types).
	 * 
	 * @param thingType
	 * @param name
	 * @return
	 */
	public Property findPropertyForThingType(ThingType thingType, String name) {
		Property prop = findProperty(thingType.getProperties(), name);
		if (prop != null) {
			return prop;
		}
		CatalogService catalog = clientFactory.getCatalogServiceClient();
		for (String childId : thingType.getChildren()) {
			ThingType child = catalog.retrieveThingType(childId);
			prop = findProperty(child.getProperties(), name);
			if (prop != null) {
				return prop;
			}
		}
		return null;
	}

	/**
	 * Find a property in a ThingType (also recurses into child types).
	 * 
	 * @param thingTypeId
	 * @param propertyName
	 * @return
	 */
	public Property searchPropForThingType(String thingTypeId,
			String propertyName) {
		try {
			return searchPropForThingType(thingTypeId, propertyName, true);
		} catch (Exception e) {
			/*
			 * if we used the cache, the exception may have been caused by a
			 * dirty cache state -> retry without cache
			 */
			return searchPropForThingType(thingTypeId, propertyName, false);
		}
	}

	/**
	 * Find a property for a Thing.
	 * 
	 * @param thingId
	 * @param propertyName
	 * @param useCache
	 *            whether to use the internal cache or not
	 * @return
	 */
	public Property searchPropForThing(String thingId, String propertyName) {
		try {
			return searchPropForThing(thingId, propertyName, true);
		} catch (Exception e) {
			/*
			 * if we used the cache, the exception may have been caused by a
			 * dirty cache state -> retry without cache
			 */
			return searchPropForThing(thingId, propertyName, false);
		}
	}

	/*
	 * PRIVATE HELPER METHODS (WHICH DO THE ACTUAL WORK)
	 */

	/**
	 * Find a property for a Thing.
	 * 
	 * @param thingId
	 * @param propertyName
	 * @param doUseCacheForSearch
	 *            whether to use the internal cache or not
	 * @return
	 */
	private Property searchPropForThing(String thingId, 
			String propertyName, boolean doUseCacheForSearch) {
		Thing thing = null;
		if (doUseCacheForSearch) {
			thing = (Thing) ModelCache.THINGS.get(thingId);
		}
		if (thing == null) {
			ThingsService things = clientFactory.getThingsServiceClient();
			thing = things.retrieve(thingId);
			ModelCache.THINGS.put(thingId, thing);
		}
		String thingTypeId = thing.getThingTypeId();
		if (StringUtils.isEmpty(thingTypeId)) {
			return null;
		}
		Property prop = searchPropForThingType(thingTypeId, propertyName);
		if(prop == null && doUseCacheForSearch) {
			throw new IllegalStateException("Could not find property named '" + 
					propertyName + "' for thing '" + thingId + "' (cache ON).");
		}
		return prop;
	}

	/**
	 * Find a property in a ThingType (also recurses into child types).
	 * 
	 * @param thingTypeId
	 * @param propertyName
	 * @param doUseCacheForSearch
	 * @return
	 */
	public Property searchPropForThingType(String thingTypeId,
			String propertyName, boolean doUseCacheForSearch) {
		ThingType tt = null;
		if(doUseCacheForSearch) {
			tt = (ThingType) ModelCache.THINGTYPES.get(thingTypeId);
		}
		if (tt == null) {
			CatalogService catalog = clientFactory.getCatalogServiceClient();
			tt = catalog.retrieveThingType(thingTypeId);
			ModelCache.THINGTYPES.put(thingTypeId, tt);
		}
		Property property = findPropertyForThingType(tt, propertyName);
		if(property == null && doUseCacheForSearch) {
			throw new IllegalStateException("Could not find property named '" + 
					propertyName + "' for ThingType '" + thingTypeId + "' (cache ON).");
		}
		return property;
	}

}
