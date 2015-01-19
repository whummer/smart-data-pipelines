package io.riots.core.handlers.query;

import io.riots.core.repositories.TriggerRepository;
import io.riots.api.services.triggers.Trigger;
import io.riots.api.services.triggers.Trigger.TriggerType;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class TriggerQuery {

    @Autowired
    TriggerRepository repository;

    public Trigger single(String itemId) {
        return repository.findOne(itemId);
    }

    // todo implement query handling
    public List<Trigger> query(String query, Paged paged) {
        return repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }

	public long count() {
		return repository.count();
	}

	public List<Trigger> findForUser(String userId) {
		return repository.findByCreatorId(userId);
	}

	public List<Trigger> findForTypeAndUser(TriggerType type, String userId) {
		return repository.findByTypeAndCreatorId(type, userId);
	}

}
