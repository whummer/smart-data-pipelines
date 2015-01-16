package io.riots.core.repositories;

import io.riots.services.users.UserAction;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author Waldemar Hummer
 */
public interface UserActionRepository extends PagingAndSortingRepository<UserAction,String> {

	@Query("select u from UserAction u where "
			+ "u.timestamp >= ?1 and u.timestamp < ?2 and "
			+ "(?3 is null or u.userId like %?3%) and "
			+ "(?4 is null or u.type like %?4%)")
	List<UserAction> findBy(long from, long to, String user, String type);

}
