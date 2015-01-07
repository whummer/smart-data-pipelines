package io.riots.core.repositories;

import java.util.List;

import io.riots.services.apps.Application;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface ApplicationRepository extends PagingAndSortingRepository<Application,String> {

	List<Application> findByCreatorId(String userId);

	Application findByAppKey(String appKey);

}
