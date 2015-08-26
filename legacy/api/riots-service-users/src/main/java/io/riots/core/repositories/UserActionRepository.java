package io.riots.core.repositories;

import io.riots.api.services.users.UserAction;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

/**
 * @author Waldemar Hummer
 */
public interface UserActionRepository extends MongoRepository<UserAction,String> {

	static final String QUERY_FIND_ACTIONS = 
			"{"
			+ 	"timestamp: {$gte: ?0, $lte: ?1},"
			+ 	"userId: {$regex: ?2},"
			+ 	"type: {$regex: ?3},"
			+ 	"httpPath: {$regex: ?4},"
			+ 	"bytesIn: {$gte: ?5, $lt: ?6},"
			+ 	"bytesOut: {$gte: ?5, $lt: ?6}"
			+ "}";

	@Query(	QUERY_FIND_ACTIONS )
	List<UserAction> findBy(long from, long to, 
			String user, String type, String httpPath,
			long sizeFrom, long sizeTo);

	@Query(	count = true,
			value = QUERY_FIND_ACTIONS )
	long count(long from, long to, String user, String type, String httpPath,
			long sizeFrom, long sizeTo);

}