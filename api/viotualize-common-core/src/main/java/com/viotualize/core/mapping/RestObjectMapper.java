package com.viotualize.core.mapping;

import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class RestObjectMapper<S, T> {

    // todo om: polish this
    public T map(S source, Class<T> clazz) {
        T target = null;
        try {
            target = clazz.newInstance();
        } catch (InstantiationException | IllegalAccessException e) {
            e.printStackTrace();
        }

        BeanUtils.copyProperties(source, target);
        return target;
    }
}
