package io.riots.core.repositories;

import io.riots.core.model.Rating;
import io.riots.core.model.User;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

/**
 * @author whummer
 */
public interface RatingRepository extends PagingAndSortingRepository<Rating,String> {

    List<Rating> findByThing(String thing);

    List<Rating> findByThingAndUser(String thing, User user);

}
