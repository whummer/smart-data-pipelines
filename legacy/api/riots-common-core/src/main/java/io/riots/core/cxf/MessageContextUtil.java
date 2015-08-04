package io.riots.core.cxf;

import org.apache.cxf.jaxrs.ext.MessageContext;
import org.apache.cxf.jaxrs.ext.MessageContextImpl;
import org.apache.cxf.phase.PhaseInterceptorChain;
import org.springframework.stereotype.Component;

/**
 * Created by omoser on 22/01/15.
 *
 * @author omoser
 */
@Component
public class MessageContextUtil {

	public MessageContext getMessageContext() {
		return new MessageContextImpl(PhaseInterceptorChain.getCurrentMessage());
	}

	public void addLocationHeader(String location) {
		MessageContext context = new MessageContextImpl(PhaseInterceptorChain.getCurrentMessage());
		context.getHttpServletResponse().addHeader("Location", location);
	}

}
