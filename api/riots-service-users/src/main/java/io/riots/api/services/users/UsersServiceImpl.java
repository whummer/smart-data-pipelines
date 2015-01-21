package io.riots.api.services.users;

import io.riots.core.handlers.command.UserActionCommand;
import io.riots.core.handlers.command.UserCommand;
import io.riots.core.handlers.query.UserActionQuery;
import io.riots.core.handlers.query.UserQuery;
import io.riots.core.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.api.services.billing.BillingService;
import io.riots.api.services.billing.PricingPlan;
import io.riots.api.services.billing.PricingPlanAssignment;
import io.riots.api.services.billing.UserActionLimit;
import io.riots.api.services.billing.UserActionLimitStatus;
import io.riots.api.services.billing.UserUsageStatus;
import io.riots.api.services.users.UsersService;
import io.riots.api.services.users.Role;
import io.riots.api.services.users.User;
import io.riots.api.services.users.UserAction;

import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.NotImplementedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * Service for managing users in the systems.
 *
 * @author whummer
 */
@Service
public class UsersServiceImpl implements UsersService {

    @Autowired
    UserQuery userQuery;
    @Autowired
    UserCommand userCommand;
    @Autowired
    UserActionQuery userActionQuery;
    @Autowired
    UserActionCommand userActionCommand;

    @Autowired
    HttpServletRequest req;
    @Autowired
    AuthHeaders authHeaders;
    @Autowired
    ServiceClientFactory clientFactory;

	@Override
	@Timed @ExceptionMetered
    public User getInfoAboutMe() {
		User user = authHeaders.getRequestingUser(req);
		return user;
	}

	@Override
	@Timed @ExceptionMetered
	public User saveInfoAboutMe(User user) {
		return userCommand.update(user);
	}

    @Override
    @Timed @ExceptionMetered
    public User findByID(String id) {
    	User u = userQuery.findById(id);
    	return u;
    }

    @Override
    @Timed @ExceptionMetered
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    public List<User> listUsers() {
    	List<User> users = userQuery.find();
    	return users;
    }

    @Override
    @Timed @ExceptionMetered
    @PreAuthorize(Role.HAS_ROLE_ADMIN)
    public User findByEmail(String email) {
    	System.out.println("findByEmail " + email);
    	User r = userQuery.findOrCreateByEmail(email);
    	System.out.println("found: " +email + " - " + r);
    	return r;
    }

    @Override
    @Timed @ExceptionMetered
    public AuthToken login(GetAuthTokenRequest r) {
    	AuthToken response = new AuthToken();
    	response.network = r.network;
    	// TODO implement
    	throw new NotImplementedException();
    }

    @Override
    @Timed @ExceptionMetered
    public long getNumUsers() {
    	return userQuery.getCount();
    }

    /* METHODS FOR USER ACTIONS */

    @Override
    @Timed @ExceptionMetered
    public List<UserAction> getUserActions(GetUserActionsRequest req) {
    	return userActionQuery.find(req.getStartTime(), req.getEndTime(), 
    			req.getUserId(), req.getActionType(), req.getHttpPath(), 
    			req.getSizeFrom(), req.getSizeTo());
    }

    @Override
    @Timed @ExceptionMetered
    public void postUserAction(UserAction action) {
    	userActionCommand.create(action);
    }

    /* METHODS FOR USER LIMITS */

    @Override
    @Timed @ExceptionMetered
    public UserUsageStatus getUsageStatus(String userId) {
    	//User u = authHeaders.getRequestingUser(req);
    	BillingService billings = clientFactory.getBillingServiceClient();
    	PricingPlan plan = billings.getPlanForUser(userId);
    	if(plan == null) {
    		for(PricingPlan p : billings.getPlans()) {
    			if(UsersService.DEFAULT_BILLING_PLAN.equals(p.getName())) {
    				plan = p;
    				PricingPlanAssignment assign = new PricingPlanAssignment();
    				assign.setUserId(userId);
    				assign.setPlanId(plan.getId());
    		    	billings.assignPlanForUser(userId, assign);
    				break;
    			}
    		}
    	}
    	UserUsageStatus stat = new UserUsageStatus();
    	stat.setUserId(userId);
    	if(plan != null) {
    		for(UserActionLimit l : plan.getLimits()) {
    			UserActionLimitStatus s = new UserActionLimitStatus();
    			s.setUserId(userId);
    			s.setType(l.getType());
    			s.setStatus("TODO"); // TODO
    			stat.getLimitStatuses().add(s);
    		}
    	}
    	return stat;
    }

    @Override
    @Timed @ExceptionMetered
    public UserUsageStatus getUsageStatusForThisUser() {
    	User u = ServiceUtil.assertValidUser(authHeaders, req);
    	return getUsageStatus(u.getId());
    }
}
