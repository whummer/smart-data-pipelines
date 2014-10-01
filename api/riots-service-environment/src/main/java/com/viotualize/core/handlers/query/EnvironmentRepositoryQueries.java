package com.viotualize.core.handlers.query;

import com.viotualize.core.model.Environment;
import com.viotualize.core.repositories.EnvironmentRepository;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class EnvironmentRepositoryQueries extends HystrixProtectedRepositoryQueries<Environment, EnvironmentRepository> {
}
