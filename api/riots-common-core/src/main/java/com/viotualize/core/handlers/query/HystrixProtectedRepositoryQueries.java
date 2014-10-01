package com.viotualize.core.handlers.query;

import com.viotualize.core.hystrix.AbstractHystrixCommand;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.BaseObjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import javax.ws.rs.NotFoundException;
import java.util.List;

/**
 * @author omoser
 */
@Component
public class HystrixProtectedRepositoryQueries<T, R extends BaseObjectRepository<T>> {

    public static final String COMMAND_GROUP = "HystrixProtectedQuery";

    static final Logger log = LoggerFactory.getLogger(HystrixProtectedRepositoryQueries.class);

    @Autowired
    R repository;

    public T single(String id) {

        return new AbstractHystrixCommand<T>("QuerySingle", COMMAND_GROUP) {

            @Override
            protected T run() throws Exception {
                log.debug(Markers.QUERY, "Looking for entity with ID {}", id);
                T entity = repository.findOne(id);
                if (entity == null) {
                    throw new NotFoundException("No such entity: " + id);
                }

                return entity;
            }

        }.execute();
    }

    public List<T> query(String query, Paged paged) {

        return new AbstractHystrixCommand<List<T>>("QueryMany", COMMAND_GROUP) {

            @Override
            protected List<T> run() throws Exception {
                // todo implement query
                log.debug(Markers.QUERY, "Running query '{}' with paging {}", query, paged);
                List<T> entities = repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
                if (entities.isEmpty()) {
                    throw new NotFoundException("No such entity");
                }

                return entities;
            }

        }.execute();
    }
}
