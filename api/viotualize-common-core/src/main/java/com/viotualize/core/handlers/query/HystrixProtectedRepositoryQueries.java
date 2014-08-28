package com.viotualize.core.handlers.query;

import com.viotualize.core.hystrix.AbstractHystrixCommand;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.BaseObjectRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;

import javax.ws.rs.NotFoundException;
import java.util.List;

/**
 * @author omoser
 */
public class HystrixProtectedRepositoryQueries<T, R extends BaseObjectRepository<T>> {

    R repository;

    public static final String COMMAND_GROUP = "HystrixProtectedQuery";

    public static final String QUERY_SINGLE_KEY = "QuerySingle";

    static final Logger log = LoggerFactory.getLogger(HystrixProtectedRepositoryQueries.class);

    public T single(String id) {

        return new AbstractHystrixCommand<T>(QUERY_SINGLE_KEY, COMMAND_GROUP) {

            @Override
            protected T run() throws Exception {
                log.debug(Markers.COMMAND, "Looking for entity with ID {}", id);
                T entity = repository.findOne(id);
                if (entity == null) {
                    throw new NotFoundException("No such entity: " + id);
                }

                return entity;
            }

            @Override
            protected T getFallback() {
                return super.getFallback();
            }

        }.execute();


    }

    public List<T> query(String query, Paged paged) {

        return new AbstractHystrixCommand<List<T>>(QUERY_SINGLE_KEY, COMMAND_GROUP) {

            @Override
            protected List<T> run() throws Exception {
                // todo implement query
                List<T> entities = repository.findAll(new PageRequest(paged.getPage(), paged.getSize())).getContent();
                if (entities.isEmpty()) {
                    throw new NotFoundException("No such entity");
                }

                return entities;
            }

            @Override
            protected List<T> getFallback() {
                return super.getFallback();
            }

        }.execute();
    }
}
