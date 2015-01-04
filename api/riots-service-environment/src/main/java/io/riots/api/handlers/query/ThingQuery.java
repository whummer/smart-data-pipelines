package io.riots.api.handlers.query;

import io.riots.api.handlers.query.Paged;
import io.riots.core.repositories.ThingRepository;
import io.riots.model.ThingMongo;
import io.riots.services.scenario.Thing;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class ThingQuery {

    @Autowired
    ThingRepository thingRepository;

    public Thing single(String itemId) {
        return thingRepository.findOne(itemId);
    }

    // todo implement query handling
    public List<ThingMongo> query(String query, Paged paged) {
        return thingRepository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
    }

	public long count() {
		return thingRepository.count();
	}
}
