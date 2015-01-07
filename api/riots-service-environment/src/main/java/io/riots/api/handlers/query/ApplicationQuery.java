package io.riots.api.handlers.query;

import io.riots.api.handlers.query.Paged;
import io.riots.core.repositories.ApplicationRepository;
import io.riots.services.apps.Application;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class ApplicationQuery {

    @Autowired
    ApplicationRepository repository;

    public Application single(String itemId) {
        return repository.findOne(itemId);
    }

    // todo implement query handling
    public List<Application> query(String query, Paged paged) {
        return repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }

	public long count() {
		return repository.count();
	}

	public List<Application> findForUser(String userId) {
		return repository.findByCreatorId(userId);
	}

	public Application findForAppKey(String appKey) {
		return repository.findByAppKey(appKey);
	}

}
