package com.viotualize.core.handlers.command;

import com.viotualize.core.model.Environment;
import com.viotualize.core.repositories.EnvironmentRepository;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class EnvironmentRepositoryCommands extends HystrixProtectedRepositoryCommands<Environment, EnvironmentRepository> {
}
