package com.viotualize.api.handlers.command;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.netflix.hystrix.HystrixCommand;
import com.netflix.hystrix.HystrixCommandGroupKey;
import com.netflix.hystrix.HystrixCommandKey;

public abstract class AbstractHystrixCommand<T> extends HystrixCommand<T> {

    static final Logger log = LoggerFactory.getLogger(AbstractHystrixCommand.class);

    public AbstractHystrixCommand(String hystrixCommand, String hystrixCommandGroup) {
        super(Setter.withGroupKey(
                HystrixCommandGroupKey.Factory.asKey(hystrixCommandGroup)).
                andCommandKey(HystrixCommandKey.Factory.asKey(hystrixCommand)));
    }


}
