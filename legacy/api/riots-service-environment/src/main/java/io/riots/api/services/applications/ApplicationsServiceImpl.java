package io.riots.api.services.applications;

import io.riots.core.handlers.command.ApplicationCommand;
import io.riots.core.handlers.query.ApplicationQuery;
import io.riots.core.util.ServiceUtil;
import io.riots.core.auth.AuthHeaders;
import io.riots.api.services.applications.ApplicationsService;
import io.riots.api.services.applications.Application;
import io.riots.api.services.users.User;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.codahale.metrics.annotation.ExceptionMetered;
import com.codahale.metrics.annotation.Timed;

/**
 * @author whummer
 */
@Service
public class ApplicationsServiceImpl implements ApplicationsService {

	@Autowired
	ApplicationCommand command;

    @Autowired
	ApplicationQuery query;

	@Autowired
	HttpServletRequest req;

    @Autowired
	AuthHeaders authHeaders;

	@Override
	@Timed @ExceptionMetered
	public Application retrieve(String id) {
		return query.single(id);
	}

	@Override
	@Timed @ExceptionMetered
	public Application retrieveByAppKey(String appKey) {
		return query.findForAppKey(appKey);
	}

	@Override
	@Timed @ExceptionMetered
	public List<Application> list() {
		User user = ServiceUtil.assertValidUser(authHeaders, req);
		return query.findForUser(user.getId());
	}

	@Override
	@Timed @ExceptionMetered
	public Application create(Application application) {
		User user = authHeaders.getRequestingUser(req);
		application.setCreated(new Date());
		application.setCreatorId(user.getId());
		if(StringUtils.isEmpty(application.getAppKey())) {
			application.setAppKey(UUID.randomUUID().toString());
		}
		return command.create(application);
	}

	@Override
	@Timed @ExceptionMetered
	public Application update(Application application) {
		return command.update(application);
	}

	@Override
	@Timed @ExceptionMetered
	public void delete(String id) {
		command.delete(id);
	}

}
