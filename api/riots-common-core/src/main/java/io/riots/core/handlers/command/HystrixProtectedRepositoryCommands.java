//package io.riots.core.handlers.command;
//
//import io.riots.core.hystrix.AbstractHystrixCommand;
//import io.riots.core.logging.Markers;
//import io.riots.core.repositories.BaseObjectRepository;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
///**
// * @author omoser
// */
//@Component
//public class HystrixProtectedRepositoryCommands<T, R extends BaseObjectRepository<T>> {
//
//    static final Logger log = LoggerFactory.getLogger(HystrixProtectedRepositoryCommands.class);
//
//    @Autowired
//    R repository;
//
//    public T create(T entity) {
//        return new AbstractHystrixCommand<T>("create", entity.getClass().getName()) {
//
//            @Override
//            protected T run() throws Exception {
//                log.debug(Markers.COMMAND, "Persisting entity {}", entity);
//                return repository.save(entity);
//            }
//
//        }.execute();
//    }
//
//    public T update(T entity) {
//        return new AbstractHystrixCommand<T>("update", entity.getClass().getName()) {
//
//            @Override
//            protected T run() throws Exception {
//                log.debug(Markers.COMMAND, "Updating entity {}", entity);
//                return repository.save(entity);
//            }
//
//        }.execute();
//    }
//
//    public Void delete(String entityId) {
//        return new AbstractHystrixCommand<Void>("delete", entityId.getClass().getName()) { // todo use an appropriate command group name
//
//            @Override
//            protected Void run() throws Exception {
//                log.debug(Markers.COMMAND, "Deleting entity {}", entityId);
//                repository.delete(entityId);
//                return null;
//            }
//
//        }.execute();
//    }
//}
