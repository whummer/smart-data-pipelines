package io.riots.api.services.users;

import io.riots.api.services.billing.BillingService;
import io.riots.api.services.billing.PricingPlan;
import io.riots.api.services.billing.PricingPlanAssignment;
import io.riots.api.services.billing.TimePeriod;
import io.riots.api.services.billing.UserActionLimit;
import io.riots.api.services.billing.UserActionLimitStatus;
import io.riots.api.services.billing.UserUsageStatus;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.handlers.command.UserActionCommand;
import io.riots.core.handlers.command.UserCommand;
import io.riots.core.handlers.query.UserActionQuery;
import io.riots.core.handlers.query.UserQuery;
import io.riots.core.util.ServiceUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.time.DateUtils;
import org.apache.log4j.Logger;
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

	static final Logger LOG = Logger.getLogger(UsersServiceImpl.class);

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
    	stat.setPlan(plan);
    	if(plan != null) {
    		for(UserActionLimit l : plan.getLimits()) {
    			UserActionLimitStatus s = new UserActionLimitStatus();
    			s.setUserId(userId);
    			s.setType(l.getType());
    			s.setLimit(l.getLimit());
    			s.setStatus(getUserActionUsage(userId, s.getType(), l.getTime()));
    			try {
					/* try to compute percentage */
    				double limit = Double.parseDouble("" + s.getLimit());
    				double status = Double.parseDouble("" + s.getStatus());
    				s.setPercentage(status / limit * 100.0);
				} catch (Exception e) {
					/* swallow */
				}
    			s.setDisplay(true);
    			if(s.getPercentage() < 0 || s.getPercentage() > 100 || 
    					l.getTime() == TimePeriod.PER_SECOND) {
    				s.setDisplay(false);
    			}
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
    
    /* PRIVATE HELPER METHODS */

    private Object getUserActionUsage(String userId, UserActionType type, TimePeriod period) {
    	Date from = null; 
    	Date to = null;
    	if(period == TimePeriod.BILLING_PERIOD) {
    		from = getBillingPeriodStart(to);
    		to = getBillingPeriodEnd(to);
    	} else if(period == TimePeriod.OVERALL) {
    		from = new Date(0); 
        	to = new Date();
    	} else {
    		// TODO implement
    		return null;
    	}
    	return getUserActionUsage(userId, type, from.getTime(), to.getTime());
    }
    private Object getUserActionUsage(String userId, UserActionType type, long from, long to) {
    	if(type == UserActionType.API_ACCESS) {
    		return userActionQuery.count(from, to, userId, type.toString(), null, 0, 0);
    	}
    	throw new IllegalArgumentException("Unexpected user action type: " + type);
    }

	private Date getBillingPeriodStart(Date someDate) {
		someDate = DateUtils.truncate(someDate, Calendar.MONTH);
		return someDate;
	}
	private Date getBillingPeriodEnd(Date someDate) {
		Date start = getBillingPeriodStart(someDate);
		Date end = DateUtils.addMonths(start, 1);
		return end;
	}

}
