package io.riots.api.handlers.query;

import io.riots.core.repositories.RatingRepository;
import io.riots.services.users.Rating;
import io.riots.services.users.Rating.RatingAggregated;
import io.riots.services.users.User;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class RatingQuery {

    @Autowired
    RatingRepository repository;

    public Rating aggregated(String thing) {
        List<Rating> res = repository.findByThing(thing);
        return RatingAggregated.construct(res);
    }

    public Rating single(String thing, User user) {
        List<Rating> res = repository.findByThingAndUser(thing, user);
        if(res.isEmpty())
        	return null;
        return res.get(0);
    }

}
