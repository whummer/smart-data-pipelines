package com.viotualize.api.handlers.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.viotualize.core.domain.DeviceType;
import com.viotualize.core.logging.Markers;
import com.viotualize.core.repositories.DeviceTypeRepository;

/**
 * @author omoser
 * @author riox
 */
@Component
public class DeviceTypeCommand {

	static final Logger log = LoggerFactory.getLogger(DeviceTypeCommand.class);
	static final String COMMAND_GROUP = "DeviceTypeCommandGroup"; 
	static final String CREATE_DEVICE_TYPE_KEY = "CreateDeviceType";
	static final String DELETE_DEVICE_TYPE_KEY = "DeleteDeviceType";
	static final String UPDATE_DEVICE_TYPE_KEY = "UpdateDeviceType";

	@Autowired
	DeviceTypeRepository repository;

	public DeviceType create(DeviceType deviceType) {

		return new AbstractHystrixCommand<DeviceType>(CREATE_DEVICE_TYPE_KEY, COMMAND_GROUP) {

			@Override
			protected DeviceType run() throws Exception {
				log.debug(Markers.COMMAND, "Persisting DeviceType {}", deviceType);
				return repository.save(deviceType);
			}

			@Override
			protected DeviceType getFallback() {
				// TODO Auto-generated method stub
				return super.getFallback();
			}

		}.execute();
	}

	public DeviceType update(DeviceType deviceType) {
		
		
		return new AbstractHystrixCommand<DeviceType>(UPDATE_DEVICE_TYPE_KEY, COMMAND_GROUP) {

			@Override
			protected DeviceType run() throws Exception {
				log.debug(Markers.COMMAND, "Updating DeviceType {}", deviceType);
				return repository.save(deviceType);
			}

			@Override
			protected DeviceType getFallback() {
				// TODO Auto-generated method stub
				return super.getFallback();
			}

		}.execute();
		
	}

	public void delete(String deviceTypeId) {
				
		new AbstractHystrixCommand<String>(DELETE_DEVICE_TYPE_KEY, COMMAND_GROUP) {

			@Override
			protected String run() throws Exception {
				repository.delete(deviceTypeId);
				return deviceTypeId;
			}

			@Override
			protected String getFallback() {
				return super.getFallback();
			}

		}.execute();
		
	}
}
