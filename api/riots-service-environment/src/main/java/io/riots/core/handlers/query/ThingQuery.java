package io.riots.core.handlers.query;

import io.riots.core.repositories.ThingRepository;
import io.riots.api.services.model.ThingMongo;
import io.riots.api.services.scenarios.Thing;

import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 * @author whummer
 */
@Component
public class ThingQuery {

    @Autowired
    ThingRepository thingRepository;

    public Thing single(String itemId) {
        return thingRepository.findOne(itemId);
    }

    public List<Thing> queryByIds(Collection<String> ids) {
        return thingRepository.findByIdIn(ids);
    }

    public List<ThingMongo> query(String query, Paged paged) {
        return thingRepository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }

	public long count() {
		return thingRepository.count();
	}

	public long countByCreatorId(String userId) {
		return thingRepository.countByCreatorId(userId);
	}

	public List<Thing> queryForUser(String userId) {
		return thingRepository.findByCreatorId(userId);
	}

}
