package io.riots.api.services.auth;

import javax.ws.rs.core.Response;

import org.apache.log4j.Logger;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.security.access.AccessDeniedException;

/**
 * Auth permission advice for automatic weaving.
 * @author whummer
 */
/**
 * Aspect around permission checks to avoid lengthy exception outputs. Based on
 * http://stackoverflow.com/questions/4621394
 */
@Aspect
@Order(value = 1)
public class AuthPermissionAdvice {
	private final Logger LOG = Logger.getLogger(AuthPermissionAdvice.class);

	@Around("execution(@org.springframework.security.access.prepost.PreAuthorize * *(..))")
	public Object preventAccessDeniedException(ProceedingJoinPoint pjp)
			throws Throwable {
		Object retVal = null;
		try {
			retVal = pjp.proceed();
		} catch (AccessDeniedException ade) {
			LOG.info("** Access Denied ** ");
			retVal = Response.status(Response.Status.FORBIDDEN).build();
		} catch (Throwable t) {
			throw t;
		}
		return retVal;
	}
}
