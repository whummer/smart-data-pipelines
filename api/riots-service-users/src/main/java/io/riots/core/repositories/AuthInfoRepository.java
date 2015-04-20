package io.riots.core.repositories;

import io.riots.api.model.AuthInfoMongo;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface AuthInfoRepository extends PagingAndSortingRepository<AuthInfoMongo,String> {

    List<AuthInfoMongo> findByAccessToken(String token);

}
