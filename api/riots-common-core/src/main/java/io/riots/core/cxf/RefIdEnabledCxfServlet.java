package io.riots.core.cxf;

import org.apache.cxf.transport.servlet.CXFServlet;
import org.slf4j.MDC;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.UUID;

/**
 * @author omoser
 */
public class RefIdEnabledCxfServlet extends CXFServlet {

    public static final String DEFAULT_REFID_HEADER_NAME = "X-VIOT-REFID";

    private String refIdHeaderName;

    @Override
    public void init() throws ServletException {
        if (getInitParameter("REFID_HEADER_NAME") != null)
            refIdHeaderName = getInitParameter("REFID_HEADER_NAME");
        else
            refIdHeaderName = DEFAULT_REFID_HEADER_NAME;

        super.init();
    }

    @Override
    protected void invoke(HttpServletRequest request, HttpServletResponse response) throws ServletException {
        try {
            String referenceId = request.getHeader(refIdHeaderName);
            if (referenceId == null) {
                referenceId = UUID.randomUUID().toString();
            }

            MDC.put("REFID", referenceId);
            response.addHeader(refIdHeaderName, referenceId);
            super.invoke(request, response);
        } finally {
            MDC.clear();
        }
    }
}
