package io.riots.core.repositories;

import io.riots.api.services.users.Rating;
import io.riots.api.services.users.User;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
public interface RatingRepository extends PagingAndSortingRepository<Rating,String> {

    List<Rating> findByThing(String thing);

    List<Rating> findByThingAndUser(String thing, User user);

}
