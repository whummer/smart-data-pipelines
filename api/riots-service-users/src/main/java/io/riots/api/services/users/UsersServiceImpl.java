package io.riots.api.services.users;

import io.riots.api.model.UserMongo;
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
import io.riots.core.errors.ErrorCodes;
import io.riots.core.handlers.command.UserActionCommand;
import io.riots.core.handlers.command.UserCommand;
import io.riots.core.handlers.query.UserActionQuery;
import io.riots.core.handlers.query.UserQuery;
import io.riots.core.repositories.AuthInfoRepository;
import io.riots.core.repositories.UserActivationRepository;
import io.riots.core.repositories.UserPasswordRepository;
import io.riots.core.util.ServiceUtil;
import io.riots.core.util.mail.EmailSender;

import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.core.Context;

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
    AuthInfoRepository authInfoRepo;
    @Autowired
    UserPasswordRepository userPassRepo;
    @Autowired
    UserActivationRepository userActivationRepo;

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
		UserMongo userMongo = new UserMongo(user);
		return userCommand.createOrUpdate(userMongo);
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
    	User r = userQuery.findOrCreateByEmail(email);
    	return r;
    }

    /* LOGIN/AUTHENTICATION METHODS */

    @Override
    @Timed @ExceptionMetered
    public User signup(RequestSignupUser r) {
    	if(!EmailValidator.getInstance(false).isValid(r.getEmail())) {
	    	throw ServiceUtil.forbidden("Illegal email address.");
    	}
    	if(!PasswordUtils.isValid(r.password)) {
	    	throw ServiceUtil.forbidden("Invalid password (Must be longer than 6 characters).");
    	}
    	User existing = userQuery.findByEmail(r.getEmail());
    	if(existing != null) {
	    	throw ServiceUtil.forbidden("User with this email adress is already registered.");
    	}
    	UserMongo user = new UserMongo(r);
    	user = userCommand.createOrUpdate(user);

    	/* store user password entity */
    	String passHash = PasswordUtils.createHash(r.password);
    	UserPassword pass = new UserPassword(user.getId(), passHash);
    	pass = userPassRepo.save(pass);

    	/* set email activation code */
    	UserActivation act = new UserActivation(user.getId(), UUID.randomUUID().toString());
    	act.setCreated(new Date());
    	act.setCreatorId(user.getId());
    	userActivationRepo.save(act);

    	/* send activation email */
    	EmailSender.sendActivationMessage(user, act.getActivationKey());

    	return user;
    }

    @Override
    @Timed @ExceptionMetered
    public AuthInfoExternal login(RequestGetAuthToken r) {
    	AuthInfoExternal response = new AuthInfoExternal();
    	r.network = StringUtils.isEmpty(r.network) ? AuthNetwork.RIOTS : r.network;
    	response.setNetwork(r.network);
    	if(AuthNetwork.RIOTS.equals(r.network)) {
    		/* in riots, we assume that the user is identified via email. */
    		String emailIdenfifier = r.username;
    		/* check user existence */
    		User user = userQuery.findByEmail(emailIdenfifier);
    		if(user == null) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: User email unknown: '" + emailIdenfifier + "'");
    	    	throw ServiceUtil.forbidden("Login failed. Please try again.");
    		}
    		/* check activation */
    		List<UserActivation> actList = userActivationRepo.findByUserId(user.getId());
    		if(actList.size() > 1) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: Unexpected array of activations in DB for user id '" + 
    					user.getId() + "': " + actList);
    	    	throw ServiceUtil.forbidden("An error occured. Error code: " + ErrorCodes.ERR_DUPLICATE_ACTIVATION);
    		} else if(actList.size() == 1) {
    			UserActivation act = actList.get(0);
    			if(act.getActivationDate() <= 0) {
    				throw ServiceUtil.forbidden("Login error, this account is currently in state 'inactive'.");
    			}
    		}
    		/* check password */
    		List<UserPassword> userPasswords = userPassRepo.findByUserId(user.getId());
    		if(userPasswords.isEmpty() || userPasswords.size() > 1) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: Unexpected array of passwords in DB for user id '" + 
    					user.getId() + "': " + userPasswords);
    	    	throw ServiceUtil.forbidden("An error occured. Error code: " + ErrorCodes.ERR_DUPLICATE_PASSWORD);
    		}
    		String expectedPassword = userPasswords.get(0).getPassword();
    		if(!expectedPassword.equals(r.password)) {
    			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    			LOG.info("Login error: Invalid password: '" + r.password + "' vs. expected '" + expectedPassword + "'");
    	    	throw ServiceUtil.forbidden("Login failed. Please try again.");
    		}
    		response = fillInAndSaveAuthInfo(response, user);
    		return response;
    	}
    	// TODO implement for other auth networks
    	throw new NotImplementedException();
    }

    @Override
    @Timed @ExceptionMetered
    public boolean activate(RequestActivateAccount r) {
    	List<UserActivation> actList = userActivationRepo.findByActivationKey(r.activationKey);
    	if(actList.size() > 1) {
			ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
			LOG.info("Login error: Unexpected array of activations in DB for activation key '" + 
					r.activationKey + "': " + actList);
	    	throw ServiceUtil.forbidden("An error occured. Error code: " + ErrorCodes.ERR_DUPLICATE_ACTIVATION);
		} else if(actList.isEmpty()) {
    		throw ServiceUtil.forbidden("Invalid activation key.");
		}
		UserActivation act = actList.get(0);
		act.setActivationDate(System.currentTimeMillis());
		userActivationRepo.save(act);
    	return true;
    }

    @Override
    @Timed @ExceptionMetered
    public AuthInfoExternal getInfoForAuthToken(AuthToken r) {

    	/* get tokens from cache */
    	AuthInfoExternal authInfo = (AuthInfoExternal)AUTH_TOKENS_CACHE.get(r.token);
    	if(authInfo != null) {
	    	/* update info and return token */
    		authInfo = updateAndSaveAuthInfo(authInfo);
    		return authInfo;
    	}

    	/* get tokens from DB */
    	List<AuthInfoExternal> list = authInfoRepo.findByAccessToken(r.token);
    	if(list.size() == 1) {
	    	authInfo = list.get(0);
	    	/* update info and return token */
	    	authInfo = updateAndSaveAuthInfo(authInfo);
    		return authInfo;
    	} else if(list.size() > 1) {
    		LOG.warn("Multiple AuthInfo (" + list.size() + ") objects found for token string: " + r.token + " - " + list);
        	ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
        	throw ServiceUtil.forbidden("Error when trying to verify auth token");
    	}

    	if(!AuthNetwork.RIOTS.equals(r.network)) {
        	/* get tokens from external OAuth network */

    		AuthNetwork authNetwork = AuthNetwork.get(r.network);
        	AuthInfo newInfo = authNetwork.verifyAccessToken(r.token);
        	if(newInfo == null) {
        		throw ServiceUtil.forbidden("Unable to verify auth token with network '" + 
        				r.network  + "': '" + r.token + "'");
        	}
        	AuthInfoExternal newInfoToSave = new AuthInfoExternal(newInfo);
        	newInfoToSave.setAccessToken(r.token);
        	newInfoToSave.setNetwork(r.network);
            /* make sure we have a valid userId in the auth info */
        	if(StringUtils.isEmpty(newInfoToSave.getEmail())) {
        		String msg = "Unable to determine valid email address for auth token";
        		LOG.warn(msg + " " + r + " - " + newInfoToSave);
        		throw ServiceUtil.forbidden(msg);
        	}
        	User user = userQuery.findOrCreateByEmail(newInfoToSave.getEmail());
        	/* update info and return token */
    		newInfoToSave = fillInAndSaveAuthInfo(newInfoToSave, user);
        	return newInfoToSave;
    	}

    	ServiceUtil.setResponseStatus(context, HttpServletResponse.SC_FORBIDDEN);
    	throw ServiceUtil.forbidden("Unable to verify auth token");
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
    	BillingService billings = clientFactory.getBillingServiceClient(AuthHeaders.INTERNAL_CALL);
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

    private AuthInfoExternal fillInAndSaveAuthInfo(AuthInfoExternal info, User user) {
		info.setEmail(user.getEmail());
		info.setUserID(user.getId());
		String name = user.getDisplayName();
		if(!StringUtils.isEmpty(name)) {
			info.setName(name);
		}
		if(StringUtils.isEmpty(info.getAccessToken())) {
			info.setAccessToken(UUID.randomUUID().toString());
		}
		return updateAndSaveAuthInfo(info);
    }

    private AuthInfoExternal updateAndSaveAuthInfo(AuthInfoExternal info) {
    	info.setExpiry(new Date(System.currentTimeMillis() + TOKEN_EXPIRY_MS));
		info = authInfoRepo.save(info);
		/* put token to cache */
		AUTH_TOKENS_CACHE.put(info.getAccessToken(), info);
		return info;
    }

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
