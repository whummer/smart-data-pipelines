package io.riots.core.auth;

import java.io.Serializable;

import org.aopalliance.intercept.MethodInvocation;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.access.expression.SecurityExpressionRoot;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionOperations;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;

/**
 * Custom method security implementation. 
 * In general, we intercept and check all {@link PreAuthorize} annotated
 * methods using the standard Spring security mechanism. What is special here 
 * is that we assume that the invoked object (e.g., a service implementation) 
 * itself is responsible for making the authorization decision, i.e., implements
 * {@link PermissionEvaluator}.
 * @author whummer
 */
public class AuthMethodSecurityHandler extends DefaultMethodSecurityExpressionHandler {

	/**
     * Creates the root object for expression evaluation.
     */
	@Override
    protected MethodSecurityExpressionOperations createSecurityExpressionRoot(Authentication authentication, MethodInvocation invocation) {
		MethodSecurityExpressionOperations root = super.createSecurityExpressionRoot(authentication, invocation);
    	final Object invokedObject = invocation.getThis();
    	/* assume the protected object needs to implement PermissionEvaluator */
    	
    	((SecurityExpressionRoot)root).setPermissionEvaluator(new PermissionEvaluator() {
			public boolean hasPermission(Authentication authentication,
					Serializable targetId, String targetType, Object permission) {
				if(!(invokedObject instanceof AuthPermissionEvaluator)) {
		    		throw new RuntimeException("Classes with @" + PreAuthorize.class.getName() + 
		    				"(\"... hasPermission(...) ...\") annotations must implement " + 
		    				AuthPermissionEvaluator.class.getName() + 
		    				": " + invokedObject);
		    	}
		    	AuthPermissionEvaluator evaluator = (AuthPermissionEvaluator)invokedObject;
				return evaluator.hasPermission(authentication, targetId, targetType, permission);
			}
			public boolean hasPermission(Authentication authentication,
					Object targetDomainObject, Object permission) {
				if(!(invokedObject instanceof AuthPermissionEvaluator)) {
		    		throw new RuntimeException("Classes with @" + PreAuthorize.class.getName() + 
		    				"(\"... hasPermission(...) ...\") annotations must implement " + 
		    				AuthPermissionEvaluator.class.getName() + 
		    				": " + invokedObject);
		    	}
		    	AuthPermissionEvaluator evaluator = (AuthPermissionEvaluator)invokedObject;
				return evaluator.hasPermission(authentication, targetDomainObject, permission);
			}
		});
        return root;
    }

}
