package com.viotualize.core.handlers.command;

import com.viotualize.core.repositories.SmartObjectRepository;
import com.viotualize.core.repositories.domain.SmartObject;
import org.springframework.stereotype.Component;

/**
 * @author omoser
 */
@Component
public class SmartObjectRepositoryCommands extends HystrixProtectedRepositoryCommands<SmartObject, SmartObjectRepository> {
}
