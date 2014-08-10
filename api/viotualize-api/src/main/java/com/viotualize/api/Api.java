package com.viotualize.api;

import org.springframework.boot.SpringApplication;

import com.viotualize.boot.ServiceStarter;

/**
 * @author omoser
 * @author riox
 */

public class Api extends ServiceStarter { 
	
    public static void main(String[] args) {
        SpringApplication.run(Api.class);
    }

}
