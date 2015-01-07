package io.riots.api.services;

import io.riots.api.handlers.command.ApplicationCommand;
import io.riots.api.handlers.query.ApplicationQuery;
import io.riots.core.auth.AuthHeaders;
import io.riots.services.ApplicationsService;
import io.riots.services.apps.Application;
import io.riots.services.users.User;

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
		User user = authHeaders.getRequestingUser(req);
		return query.findForUser(user.getId());
	}

	@Override
	@Timed @ExceptionMetered
	public Application create(Application item) {
		User user = authHeaders.getRequestingUser(req);
		item.setCreated(new Date());
		item.setCreatorId(user.getId());
		if(StringUtils.isEmpty(item.getAppKey())) {
			item.setAppKey(UUID.randomUUID().toString());
		}
		return command.create(item);
	}

	@Override
	@Timed @ExceptionMetered
	public Application update(Application item) {
		return command.update(item);
	}

	@Override
	@Timed @ExceptionMetered
	public void delete(String id) {
		command.delete(id);
	}

}
