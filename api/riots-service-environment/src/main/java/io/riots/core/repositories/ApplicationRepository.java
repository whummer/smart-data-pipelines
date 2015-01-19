package io.riots.core.repositories;

import java.util.List;

import io.riots.api.services.applications.Application;

import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Component;

/**
 * @author whummer
 */
public interface ApplicationRepository extends PagingAndSortingRepository<Application,String> {

	List<Application> findByCreatorId(String userId);

	Application findByAppKey(String appKey);

}
