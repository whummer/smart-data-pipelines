package io.riots.services;

/**
 * Created by omoser on 16/01/15.
 *
 * @author omoser
 */

import org.springframework.context.annotation.Import;

import java.lang.annotation.*;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Import(RiotsRegistryConfiguration.class)
public @interface EnableRiotsServiceRegistry {
}
