package io.riots.core.repositories;

import io.riots.api.services.applications.Application;

import java.util.List;

import org.springframework.data.repository.PagingAndSortingRepository;

/**
 * @author whummer
 */
public interface ApplicationRepository extends PagingAndSortingRepository<Application,String> {

	List<Application> findByCreatorId(String userId);

	Application findByAppKey(String appKey);

}
