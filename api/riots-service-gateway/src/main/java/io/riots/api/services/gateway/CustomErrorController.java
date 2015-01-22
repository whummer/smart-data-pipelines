package io.riots.api.services.gateway;

import java.io.IOException;
import java.util.Arrays;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.springframework.boot.autoconfigure.web.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {

	static final Logger LOGGER = Logger.getLogger(CustomErrorController.class);

	@RequestMapping(value = "/error")
	public void error(HttpServletRequest req, HttpServletResponse resp) throws IOException {
		int status = resp.getStatus();
		if(!Arrays.asList(500, 404).contains(status)) {
			status = 500;
		}
		resp.sendRedirect("/error/" + status + ".html");
	}

	@Override
	public String getErrorPath() {
		return "/error";
	}
}