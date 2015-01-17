package io.riots.api.handlers.query;

import io.riots.core.repositories.UserActionRepository;
import io.riots.services.users.UserAction;

import java.util.Date;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
@Component
public class UserActionQuery {

    @Autowired
    UserActionRepository repository;

    public List<UserAction> find(long from, long to, String user, 
    		String type, String httpPath, long sizeFrom, long sizeTo) {
    	if(to <= 0)
    		to = new Date().getTime();
    	if(from > to)
    		from = 0;
    	if(StringUtils.isEmpty(user))
    		user = ".*";
    	if(StringUtils.isEmpty(type))
    		type = ".*";
    	if(StringUtils.isEmpty(httpPath))
    		httpPath = ".*";
    	if(sizeTo <= 0)
    		sizeTo = Long.MAX_VALUE;
    	if(sizeFrom > sizeTo)
    		sizeFrom = 0;
    	return repository.findBy(from, to, user, type, httpPath, sizeFrom, sizeTo);
    }
}
