package com.viotualize.core.handlers.query;

import com.viotualize.core.repositories.SmartObjectRepository;
import com.viotualize.core.repositories.domain.SmartObject;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class SmartObjectRepositoryQueries extends HystrixProtectedRepositoryQueries<SmartObject, SmartObjectRepository> {
}
