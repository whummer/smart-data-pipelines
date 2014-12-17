package io.riots.api.handlers.command;

import io.riots.core.logging.Markers;
import io.riots.core.model.SemanticType;
import io.riots.core.repositories.SemanticTypeRepository;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class SemanticTypeCommand {

    static final Logger log = LoggerFactory.getLogger(SemanticTypeCommand.class);

	@Autowired
    SemanticTypeRepository repository;

	public SemanticType getOrCreate(SemanticType item) {
		List<SemanticType> list = repository.findByCategoryAndName(item.getCategory(), item.getName());
    	if(!list.isEmpty()) {
    		return list.get(0);
    	}
        log.debug(Markers.COMMAND, "Persisting SemanticType {}", item);
        return repository.save(item);
    }

}
