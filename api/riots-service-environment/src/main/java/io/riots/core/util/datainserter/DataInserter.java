package io.riots.core.util.datainserter;

import io.riots.api.services.scenarios.PropertyValue;
import io.riots.api.services.streams.StreamRestriction;
import io.riots.core.jms.EventBrokerComponent;
import io.riots.core.repositories.PropertyValueRepository;
import io.riots.core.repositories.StreamRestrictionRepository;
import io.riots.core.util.PropertyUtil;
import io.riots.core.util.ServiceUtil;

import java.net.URI;
import java.util.List;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import javax.ws.rs.core.Context;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.common.cache.CacheBuilder;

/**
 * @author whummer
 */
@Component
public class DataInserter {

    @Autowired
    PropertyValueRepository propValueRepo;
    @Autowired
    StreamRestrictionRepository streamRestrRepo;

    @Context
    MessageContext context;

    @Autowired
    EventBrokerComponent eventBroker;

	public final ConcurrentMap<Object,Object> CACHE_RESTRICTIONS = 
			CacheBuilder.newBuilder()
		    .maximumSize(100)
		    .expireAfterWrite(5, TimeUnit.SECONDS) // TODO fix
		    .build().asMap();

	public URI postValue(PropertyValue propValue) {
		if(propValue.getTimestamp() <= 0) {
			propValue.setTimestamp(System.currentTimeMillis());
		}
    	propValue = propValueRepo.save(propValue);
    	URI uri = null;
		if(context != null && context.getHttpServletRequest() != null) {
			uri = ServiceUtil.getPath(context, String.format("../../data/%s", propValue.getId()));
		}
		if(prepareForSending(propValue)) {
			eventBroker.sendOutboundChangeNotifyMessage(propValue);
		}
    	return uri;
	}

	public static class PropValueWrapper {
		PropertyValue propValue;
		public PropValueWrapper(PropertyValue propValue) {
			this.propValue = propValue;
		}
		@Override
		public int hashCode() {
			int hc = 0;
			if(propValue.getPropertyName() != null)
				hc += propValue.getPropertyName().hashCode();
			if(propValue.getThingId() != null)
				hc += propValue.getThingId().hashCode();
			return hc;
		}
		@Override
		public boolean equals(Object obj) {
			if(!(obj instanceof PropValueWrapper))
				return false;
			PropValueWrapper w = (PropValueWrapper)obj;
			// TODO consider also stream id (for stream restrictions)
			if(w.propValue.getPropertyName() != null &&
					!w.propValue.getPropertyName().equals(propValue.getPropertyName())) {
				return false;
			}
			if(w.propValue.getThingId() != null &&
					!w.propValue.getThingId().equals(propValue.getThingId())) {
				return false;
			}
			return true;
		}
	}

	private boolean prepareForSending(PropertyValue propValue) {
		PropValueWrapper w = new PropValueWrapper(propValue);
		@SuppressWarnings("unchecked")
		List<StreamRestriction> restr = (List<StreamRestriction>) CACHE_RESTRICTIONS.get(w);
		if(restr == null) {
			restr = streamRestrRepo.findByThingId(propValue.getThingId());
			CACHE_RESTRICTIONS.putIfAbsent(w, restr);
		}
		boolean perm = isAccessPermitted(propValue, restr);
//		System.out.println("isAccessPermitted " + perm + " - " + propValue + " - " + restr);
		if(!perm) {
			return false;
		}
//		System.out.println("---------");
		removeSubPropertiesIfNecessary(propValue, restr);
//		System.out.println("/---------");
		return perm;
	}

	private boolean isAccessPermitted(PropertyValue propValue, List<StreamRestriction> restrs) {
		for(StreamRestriction r : restrs) {
			if(r.getThingId().matches(propValue.getThingId()) && 
					(r.getPropertyName().matches(propValue.getPropertyName()) || 
							r.getPropertyName().matches(propValue.getLocalName())) && 
					!r.isVisible()) {
				return false;
			}
		}
		return true;
	}

	private void removeSubPropertiesIfNecessary(PropertyValue propValue, List<StreamRestriction> restrs) {
		List<PropertyValue> childProps = PropertyUtil.getChildren(propValue);
		//System.out.println("child props: " + childProps + " - " + restrs);
		for(PropertyValue childPropValue : childProps) {
			boolean perm = isAccessPermitted(childPropValue, restrs);
			//System.out.println("access to subprop permitted: " + perm + " - " + childPropValue + " - " + childPropValue.getLocalName());
			if(!perm) {
//				Object deleted = 
				PropertyUtil.removeChildProperty(propValue, childPropValue);
//				System.out.println("Removing restricted property " + 
//						childPropValue.getPropertyName() + " - " + 
//						childPropValue.getLocalName() + " - " + deleted);
			}
		}
	}

}
