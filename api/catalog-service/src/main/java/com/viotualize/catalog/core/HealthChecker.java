//package com.viotualize.catalog.core;
//
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Component;
//
//import com.codahale.metrics.MetricRegistry;
//import com.netflix.appinfo.HealthCheckHandler;
//import com.netflix.appinfo.InstanceInfo.InstanceStatus;
//
//@Component
//public class HealthChecker implements HealthCheckHandler {
//
//	@Autowired
//	private MetricRegistry metricRegistry;
//	
//	public HealthChecker() {
//		System.out.println("MetricRegistry: " + metricRegistry);
//	}
//	
//	@Override
//	public InstanceStatus getStatus(InstanceStatus status) {
//		return InstanceStatus.DOWN;
//	}
//
//}
