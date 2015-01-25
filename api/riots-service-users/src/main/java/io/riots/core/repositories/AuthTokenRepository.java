package io.riots.core.repositories;

import io.riots.api.services.users.AuthToken;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface AuthTokenRepository extends PagingAndSortingRepository<AuthToken,String> {

    List<AuthToken> findByToken(String token);

}
