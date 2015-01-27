package io.riots.core.repositories;

import io.riots.api.services.users.AuthInfoExternal;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface AuthInfoRepository extends PagingAndSortingRepository<AuthInfoExternal,String> {

    List<AuthInfoExternal> findByAccessToken(String token);

}
