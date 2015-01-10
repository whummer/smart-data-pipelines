package io.riots.core.auth;

import java.lang.reflect.Method;

import javax.ws.rs.ForbiddenException;

import org.apache.log4j.Logger;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;

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
	final Logger LOG = Logger.getLogger(AuthPermissionAdvice.class);

	/* we cannot use this pointcut because the @PreAuthorize annotations
	 * are on the service interfaces, which is not supported by AspectJ:

		@Around("execution(@org.springframework.security.access.prepost.PreAuthorize * *(..))")

	 * */
	@Around("execution(* (@org.springframework.stereotype.Service *).*(..))")
	public Object preventAccessDeniedException(ProceedingJoinPoint pjp)
			throws Throwable {
		MethodSignature signature = (MethodSignature) pjp.getSignature();
	    Method method = signature.getMethod();
	    PreAuthorize anno = method.getAnnotation(PreAuthorize.class);

	    if(anno == null) {
	    	return pjp.proceed();
	    }

	    /* make try-catch call */
		Object retVal = null;
		try {
			retVal = pjp.proceed();
		} catch (AccessDeniedException ade) {
			throw new ForbiddenException("Access Denied.");
		} catch (Throwable t) {
			throw t;
		}
		return retVal;
	}

//	@Pointcut("call(@org.springframework.stereotype.Service * *.*(..)) && args() && if()")
	public static boolean isProtectedServiceMethod(
			//JoinPoint joinPoint
			//, JoinPoint.EnclosingStaticPart esjp
			) {
		//System.out.println(" -----> " + joinPoint.getSignature());
		return true;
	}
}
