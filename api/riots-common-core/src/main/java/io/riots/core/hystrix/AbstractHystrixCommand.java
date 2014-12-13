//package io.riots.core.hystrix;
//
//import com.netflix.hystrix.HystrixCommand;
//import com.netflix.hystrix.HystrixCommandGroupKey;
//import com.netflix.hystrix.HystrixCommandKey;
//
///**
// * 
// * @author riox
// *
// * @param <T> the type that the {@link HystrixCommand}'s <code>run()</code> methods should return. 
// */
//public abstract class AbstractHystrixCommand<T> extends HystrixCommand<T> {
//
//    public AbstractHystrixCommand(String hystrixCommand, String hystrixCommandGroup) {
//        super(Setter.withGroupKey(
//                HystrixCommandGroupKey.Factory.asKey(hystrixCommandGroup)).
//                andCommandKey(HystrixCommandKey.Factory.asKey(hystrixCommand)));
//    }
//
//}
