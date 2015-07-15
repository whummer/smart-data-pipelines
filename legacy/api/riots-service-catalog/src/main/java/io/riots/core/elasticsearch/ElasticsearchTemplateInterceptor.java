package io.riots.core.elasticsearch;

import io.riots.api.services.catalog.Manufacturer;
import io.riots.api.services.catalog.ThingType;
import io.riots.api.services.catalog.model.ManufacturerElastic;
import io.riots.api.services.catalog.model.ThingTypeElastic;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;

/**
 * Created by omoser on 18/01/15.
 *
 * @author omoser
 */
@Aspect
@SuppressWarnings("all")
public class ElasticsearchTemplateInterceptor {


    @Around("bean(elasticsearchTemplate)")
    public Object insertDocumentedClassForMethod(ProceedingJoinPoint pjp) throws Throwable {
        Object[] args = pjp.getArgs();
        if (args != null) {
            Object[] documentedArgs = new Object[args.length];
            for (int i = 0; i < args.length; i++) {
                Object arg = args[i];
                if (arg instanceof Class) {
                    Class clazz = (Class) arg;
                    if (clazz.isAssignableFrom(ThingType.class)) {
                        documentedArgs[i] = ThingTypeElastic.class;
                    } else if (clazz.isAssignableFrom(Manufacturer.class)) {
                        documentedArgs[i] = ManufacturerElastic.class;
                    }
                } else {
                    documentedArgs[i] = arg;
                }
            }

            return pjp.proceed(documentedArgs); // todo <-- public abstract void org.springframework.data.elasticsearch.core.ElasticsearchOperations.refresh(java.lang.Class,boolean)
        }

        return pjp.proceed();
    }
}
