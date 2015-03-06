package io.riots.api.services.triggers;

import io.riots.api.services.triggers.Trigger.TriggerType;
import io.riots.api.services.users.User;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.handlers.command.TriggerCommand;
import io.riots.core.handlers.query.TriggerQuery;
import io.riots.core.triggers.TriggerFunctionListener;
import io.riots.core.util.ServiceUtil;

import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * @author whummer
 */
@Service
public class TriggersServiceImpl implements TriggersService {

	private static final Logger LOG = Logger.getLogger(TriggersServiceImpl.class);

	@Autowired
	AuthHeaders authHeaders;
	@Autowired
	HttpServletRequest req;

	@Autowired
	TriggerCommand triggerCmd;

	@Autowired
	TriggerQuery triggerQuery;

	@Autowired
	TriggerFunctionListener funcListener;

	/* API METHODS FOR TRIGGERS */

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
	public void removeTrigger(String id, String creatorId) {
		doRemoveTrigger(id, creatorId);
	}

	@Override
	public void removeTrigger(String creatorId) {
		doRemoveTrigger(null, creatorId);
	}

	/* PRIVATE HELPER METHODS */

	@SuppressWarnings("unchecked")
	private <T extends Trigger> T doSetupTrigger(T t) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		t.setCreatorId(user.getId());
		t.setCreated(new Date());
		t = (T) triggerCmd.create(t);
		if(t instanceof ThingPropsFunction) {
			t = (T)funcListener.addFunction((ThingPropsFunction)t);
		} else {
			LOG.warn("Unexpected trigger type: " + t);
		}
		return t;
	}

	@SuppressWarnings("unchecked")
	private <T extends Trigger> T doUpdateTrigger(T t) {
		// TODO check permissions
		//User user = ServiceUtil.assertValidUser(authHeaders, req);
		t = (T) triggerCmd.update(t);
		if(t instanceof ThingPropsFunction) {
			t = (T)funcListener.updateFunction((ThingPropsFunction)t);
		} else {
			LOG.warn("Unexpected trigger type: " + t);
		}
		return t;
	}

	private void doRemoveTrigger(String id, String creatorId) {
		if (creatorId != null) {
			triggerCmd.deleteAllForCreator(creatorId);
			funcListener.removeAllForCreator(creatorId);
		} else {
			funcListener.removeFunction(id);
			triggerCmd.delete(id);
		}

	}

	@SuppressWarnings("unchecked")
	private <T extends Trigger> List<T> doListTriggers(Class<T> specialClass) {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		if (specialClass == null) {
			return (List<T>) triggerQuery.findForUser(user.getId());
		}
		TriggerType specialType = null;
		if (specialClass == GeoFence.class) {
			specialType = TriggerType.GEO_FENCE;
		} else if (specialClass == ThingPropsFunction.class) {
			specialType = TriggerType.FUNCTION;
		}
		return (List<T>) triggerQuery.findForTypeAndUser(specialType, user.getId());
	}

}
