package io.riots.core.auth;

import javax.ws.rs.ForbiddenException;

import org.apache.log4j.Logger;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.core.annotation.Order;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

/**
 * Auth permission advice for automatic weaving.
 * @author whummer
 */
/**
 * Aspect around permission checks to avoid lengthy exception outputs. Based on
 * http://stackoverflow.com/questions/4621394
 */
@Component
@Aspect
@Order(value = 1)
public class AuthPermissionAdvice {
	final Logger LOG = Logger.getLogger(AuthPermissionAdvice.class);

	/* we cannot use this pointcut because the @PreAuthorize annotations
	 * are on the clients interfaces, which is not supported by AspectJ:

		@Around("call(@org.springframework.security.access.prepost.PreAuthorize * *(..))")

	 * */
	@Around("execution(* org.springframework.security.access.vote.AffirmativeBased.decide(..))")
	public Object preventAccessDeniedException(ProceedingJoinPoint pjp)
			throws Throwable {

	    /* make try-catch call */
		Object retVal = null;
		try {
			retVal = pjp.proceed();
		} catch (AccessDeniedException ade) {
			throw new ForbiddenException("Access Denied.", ade);
		} catch (Throwable t) {
			throw t;
		}
		return retVal;
	}

}
