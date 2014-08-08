package com.viotualize.api.services;

import javax.ws.rs.Path;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.viotualize.api.handlers.command.DeviceCommand;
import com.viotualize.api.handlers.query.DeviceQuery;
import com.wordnik.swagger.annotations.Api;

/**
 * @author Waldemar Hummer
 */
@Service
@Path("/simulations")
@Api(value = "Simulations", description = "API for simulations")
public class Simulations {

    @Autowired
    DeviceQuery deviceQuery;

    @Autowired
    DeviceCommand deviceCommand;

}
