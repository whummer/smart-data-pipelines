package io.riots.core.repositories;

import io.riots.services.users.UserAction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.data.repository.Repository;

/**
 * @author Waldemar Hummer
 */
//@org.springframework.stereotype.Repository // CGLIB: Cannot subclass final class class com.sun.proxy.$Proxy98
public interface UserActionRepository 
	//extends JpaRepository<UserAction,String> // org.springframework.data.mapping.PropertyReferenceException: No property deleteAllInBatch found for type void!
//	extends PagingAndSortingRepository<UserAction,String>
	extends Repository<UserAction,String>
{

	@Query("select u from UserAction u where "
			+ "u.timestamp >= ?1 and u.timestamp < ?2 and "
			+ "(?3 is null or u.userId like %?3%) and "
			+ "(?4 is null or u.type like %?4%) and "
			+ "(?5 is null or u.httpPath like %?5%) and "
			+ "(?6 <= 0 or (u.bytesIn >= ?6 and u.bytesOut >= ?6)) and "
			+ "(?7 <= 0 or (u.bytesIn <= ?7 and u.bytesOut <= ?7))")
	List<UserAction> findBy(long from, long to, 
			String user, String type, String httpPath,
			long sizeFrom, long sizeTo);

}
