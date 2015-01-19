package io.riots.core.mongodb.cascade;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * http://maciejwalkowiak.pl/blog/2012/04/30/spring-data-mongodb-cascade-save-on-dbref-objects/
 * https://github.com/spring-projects/spring-data-mongodb/pull/3
 */
@Retention(RetentionPolicy.RUNTIME)
@Target({ ElementType.FIELD })
public @interface CascadeSave {

}
