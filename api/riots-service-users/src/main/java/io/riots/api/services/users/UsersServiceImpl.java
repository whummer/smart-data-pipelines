package io.riots.api.services.users;

import io.riots.api.services.billing.BillingService;
import io.riots.api.services.billing.PricingPlan;
import io.riots.api.services.billing.PricingPlanAssignment;
import io.riots.api.services.billing.TimePeriod;
import io.riots.api.services.billing.UserActionLimit;
import io.riots.api.services.billing.UserActionLimitStatus;
import io.riots.api.services.billing.UserUsageStatus;
import io.riots.core.auth.AuthHeaders;
import io.riots.core.auth.AuthNetwork;
import io.riots.core.auth.PasswordUtils;
import io.riots.core.clients.ServiceClientFactory;
import io.riots.core.handlers.command.UserActionCommand;
import io.riots.core.handlers.command.UserCommand;
import io.riots.core.handlers.query.UserActionQuery;
import io.riots.core.handlers.query.UserQuery;
import io.riots.core.repositories.AuthTokenRepository;
import io.riots.core.repositories.UserPasswordRepository;
import io.riots.core.util.ServiceUtil;

import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.ForbiddenException;
import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.apache.commons.lang.time.DateUtils;
import org.apache.commons.validator.routines.EmailValidator;
import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;
import com.google.common.cache.CacheBuilder;

/**
 * Service for managing users in the systems.
 *
 * @author whummer
 */
@Service
public class UsersServiceImpl implements UsersService {

	static final Logger LOG = Logger.getLogger(UsersServiceImpl.class);

	private static final int TOKEN_EXPIRY_MS = 1000 * 60 * 60;

	/**
	 * Cache for auth tokens.
	 */
	private static final ConcurrentMap<Object,Object> AUTH_TOKENS_CACHE = 
			CacheBuilder.newBuilder()
		    .maximumSize(500)
		    .expireAfterWrite(5, TimeUnit.MINUTES)
		    .build().asMap();

    @Autowired
    UserQuery userQuery;
    @Autowired
    UserCommand userCommand;
    @Autowired
    UserActionQuery userActionQuery;
    @Autowired
    UserActionCommand userActionCommand;
    @Autowired
    AuthTokenRepository authTokenRepo;
    @Autowired
    UserPasswordRepository userPassRepo;

    @Autowired
    HttpServletRequest req;
    @Autowired
    AuthHeaders authHeaders;
    @Context
    MessageContext context;
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
		return userCommand.createOrUpdate(user);
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

    /* LOGIN/AUTHENTICATION METHODS */

    @Override
    @Timed @ExceptionMetered
    public User signup(RequestSignupUser r) {
    	if(!EmailValidator.getInstance(false).isValid(r.getEmail())) {
	    	throw forbidden("Illegal email address.");
    	}
    	if(!PasswordUtils.isValid(r.password)) {
	    	throw forbidden("Invalid password (Must be longer than 6 characters).");
    	}
    	User existing = userQuery.findByEmail(r.getEmail());
    	if(existing != null) {
	    	throw forbidden("User with this email adress is already registered.");
    	}
    	User u = userCommand.createOrUpdate(r);
    	String passHash = PasswordUtils.createHash(r.password);
    	UserPassword pass = new UserPassword(u.getId(), passHash);
    	userPassRepo.save(pass);
    	return u;
    }

    private WebApplicationException webappError(int status, String msg) {
    	Map<String,Object> response = new HashMap<>();
    	response.put("status", status);
    	response.put("message", msg);
    	return new WebApplicationException(Response.status(status)
    			.entity(response)
    			.header("Content-Type", MediaType.APPLICATION_JSON)
    			.build());
    }
    private WebApplicationException forbidden(String msg) {
    	return webappError(HttpServletResponse.SC_FORBIDDEN, msg);
    }

    @Override
    @Timed @ExceptionMetered
    public AuthToken login(RequestGetAuthToken r) {
    	AuthToken response = new AuthToken();
    	r.network = StringUtils.isEmpty(r.network) ? AuthNetwork.RIOTS : r.network;
    	response.network = r.network;
    	if(AuthNetwork.RIOTS.equals(r.network)) {
    		/* in riots, we assume that the user is identified via email. */
    		String emailIdenfifier = r.username;
    		User user = userQuery.findByEmail(emailIdenfifier);
    		if(user == null) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: User email unknown: '" + emailIdenfifier + "'");
    	    	throw new ForbiddenException();
    		}
    		List<UserPassword> userPasswords = userPassRepo.findByUserId(user.getId());
    		if(userPasswords.isEmpty() || userPasswords.size() > 1) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: Unexpected array of passwords in DB for user id '" + 
    					user.getId() + "': " + userPasswords);
    	    	throw new ForbiddenException();
    		}
    		String expectedPassword = userPasswords.get(0).getPassword();
    		if(!expectedPassword.equals(r.password)) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: Invalid password: '" + r.password + "' vs. expected '" + expectedPassword + "'");
    	    	throw new ForbiddenException();
    		}
    		response.token = UUID.randomUUID().toString();
    		response.expiry = System.currentTimeMillis() + TOKEN_EXPIRY_MS;
    		response = authTokenRepo.save(response);
    		AUTH_TOKENS_CACHE.put(response.token, response);
    		return response;
    	}
    	// TODO implement for other auth networks
    	throw new NotImplementedException();
    }

    @Override
    @Timed @ExceptionMetered
    public AuthToken verifyAuthToken(AuthToken r) {
    	/* get tokens from cache */
    	AuthToken token = (AuthToken)AUTH_TOKENS_CACHE.get(r.token);
    	if(token != null) {
    		return token;
    	}
    	/* get tokens from DB */
    	List<AuthToken> tokens = authTokenRepo.findByToken(r.token);
    	if(tokens.size() == 1) {
	    	token = tokens.get(0);
	    	/* update expiry date */
    		token.expiry = System.currentTimeMillis() + TOKEN_EXPIRY_MS;
    		token = authTokenRepo.save(token);
    		/* put token to cache */
    		AUTH_TOKENS_CACHE.put(token.token, token);
	    	/* return valid token */
    		return token;
    	} else if(tokens.size() > 1) {
    		LOG.warn("Multiple AuthToken objects found for token string: " + r.token);
    	}
    	ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    	throw new ForbiddenException();
    }

    @Override
    @Timed @ExceptionMetered
    public long getNumUsers() {
    	return userQuery.getCount();
    }

    /* METHODS FOR USER ACTIONS */

    @Override
    @Timed @ExceptionMetered
    public List<UserAction> getUserActions(RequestGetUserActions req) {
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
