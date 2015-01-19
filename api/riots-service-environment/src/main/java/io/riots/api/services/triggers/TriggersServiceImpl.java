package io.riots.api.services.triggers;

import io.riots.core.handlers.command.TriggerCommand;
import io.riots.core.handlers.query.TriggerQuery;
import io.riots.core.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.util.geo.GeoPositionListener;
import io.riots.api.services.triggers.GeoFence;
import io.riots.api.services.triggers.Trigger;
import io.riots.api.services.triggers.Trigger.TriggerType;
import io.riots.api.services.users.User;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
public class TriggersServiceImpl implements GeoFence.TriggersService {

	@Autowired
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Autowired
	TriggerCommand triggerCmd;
	@Autowired
	TriggerQuery triggerQuery;

	@Autowired
	GeoPositionListener geoListener;

	/* GENERIC TRIGGER METHODS */

	@Override
	public List<Trigger> listTriggers() {
		return doListTriggers(null);
	}

	@Override
	public Trigger setupTrigger(Trigger t) {
		return doSetupTrigger(t);
	}

	@Override
	public Trigger updateTrigger(Trigger t) {
		return doUpdateTrigger(t);
	}

	@Override
	public void removeTrigger(String id) {
		doRemoveTrigger(id, null);
	}

	/* GEO FENCES */

	@Override
	@Timed @ExceptionMetered
	public List<GeoFence> listGeoFences() {
		return doListTriggers(GeoFence.class);
	}

	@Override
	@Timed @ExceptionMetered
	public GeoFence setupGeoFence(GeoFence fence) {
		return doSetupTrigger(fence);
	}

	@Override
	@Timed @ExceptionMetered
	public void removeGeoFence(String id) {
		doRemoveTrigger(id, GeoFence.class);
	}

	/* PRIVATE HELPER METHODS */

	@SuppressWarnings("unchecked")
	private <T extends Trigger> T doSetupTrigger(T t) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		t.setCreatorId(user.getId());
		t.setCreated(new Date());
		t = (T) triggerCmd.create(t);
		if(t instanceof GeoFence) {
			geoListener.addGeoFence((GeoFence)t);
		}
		return t;
	}

	@SuppressWarnings("unchecked")
	private <T extends Trigger> T doUpdateTrigger(T t) {
		// TODO check permissions
		//User user = ServiceUtil.assertValidUser(authHeaders, req);
		t = (T) triggerCmd.update(t);
		if(t instanceof GeoFence) {
			geoListener.updateGeoFence((GeoFence)t);
		}
		return t;
	}

	private void doRemoveTrigger(String id, Class<? extends Trigger> triggerClass) {
		if(triggerClass == null) {
			Trigger t = triggerQuery.single(id);
			if(t != null) {
				triggerClass = t.getClass();
			}
		}
		if(triggerClass == GeoFence.class) {
			geoListener.removeGeoFence(id);
		}
		triggerCmd.delete(id);
	}

	@SuppressWarnings("unchecked")
	private <T extends Trigger> List<T> doListTriggers(Class<T> specialClass) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		if(specialClass == null) {
			return (List<T>)triggerQuery.findForUser(user.getId());
		}
		TriggerType specialType = null;
		if(specialClass == GeoFence.class) {
			specialType = TriggerType.GEO_FENCE;
		}
		return (List<T>) triggerQuery.findForTypeAndUser(specialType, user.getId());
	}

}
