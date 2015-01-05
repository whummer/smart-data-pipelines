/*** Eclipse Class Decompiler plugin, copyright (c) 2012 Chao Chen (cnfree2000@hotmail.com) ***/
package org.tuckey.web.filters.urlrewrite;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.tuckey.web.filters.urlrewrite.Conf;
import org.tuckey.web.filters.urlrewrite.Status;
import org.tuckey.web.filters.urlrewrite.UrlRewriteFilter;
import org.tuckey.web.filters.urlrewrite.UrlRewriteWrappedResponse;
import org.tuckey.web.filters.urlrewrite.UrlRewriter;
import org.tuckey.web.filters.urlrewrite.utils.Log;
import org.tuckey.web.filters.urlrewrite.utils.ModRewriteConfLoader;
import org.tuckey.web.filters.urlrewrite.utils.NumberUtils;
import org.tuckey.web.filters.urlrewrite.utils.ServerNameMatcher;
import org.tuckey.web.filters.urlrewrite.utils.StringUtils;

@SuppressWarnings("all")
public class UrlRewriteFilter implements Filter {
	private static Log log = Log.getLog(UrlRewriteFilter.class);

	/** @deprecated */
	public static final String VERSION = "4.0.3";
	public static final String DEFAULT_WEB_CONF_PATH = "/WEB-INF/urlrewrite.xml";
	private UrlRewriter urlRewriter;
	private boolean confReloadCheckEnabled;
	private int confReloadCheckInterval;
	private boolean allowConfSwapViaHttp;
	private long confLastLoad;
	private Conf confLastLoaded;
	private long confReloadLastCheck;
	private boolean confLoadedFromFile;
	private String confPath;
	private boolean confReloadInProgress;
	private boolean statusEnabled;
	private String statusPath;
	private boolean modRewriteStyleConf;
	public static final String DEFAULT_MOD_REWRITE_STYLE_CONF_PATH = "/WEB-INF/.htaccess";
	private ServerNameMatcher statusServerNameMatcher;
	private static final String DEFAULT_STATUS_ENABLED_ON_HOSTS = "localhost, local, 127.0.0.1";
	private ServletContext context;
	private static long INITIALISED_TIME = System.currentTimeMillis();

	public UrlRewriteFilter() {
		this.urlRewriter = null;

		this.confReloadCheckEnabled = false;

		this.confReloadCheckInterval = 0;

		this.allowConfSwapViaHttp = false;

		this.confLastLoad = 0L;
		this.confLastLoaded = null;
		this.confReloadLastCheck = 30L;
		this.confLoadedFromFile = true;

		this.confReloadInProgress = false;

		this.statusEnabled = true;
		this.statusPath = "/rewrite-status";

		this.modRewriteStyleConf = false;

		this.context = null;
	}

	public void init(FilterConfig filterConfig) throws ServletException {
		log.debug("filter init called");

		if (filterConfig == null) {
			log.error("unable to init filter as filter config is null");
			return;
		}

		log.debug("init: calling destroy just in case we are being re-inited uncleanly");
		destroyActual();

		this.context = filterConfig.getServletContext();
		if (this.context == null) {
			log.error("unable to init as servlet context is null");
			return;
		}

		Log.setConfiguration(filterConfig);

		String confReloadCheckIntervalStr = filterConfig
				.getInitParameter("confReloadCheckInterval");
		String confPathStr = filterConfig.getInitParameter("confPath");
		String statusPathConf = filterConfig.getInitParameter("statusPath");
		String statusEnabledConf = filterConfig
				.getInitParameter("statusEnabled");
		String statusEnabledOnHosts = filterConfig
				.getInitParameter("statusEnabledOnHosts");

		String allowConfSwapViaHttpStr = filterConfig
				.getInitParameter("allowConfSwapViaHttp");
		if (!(StringUtils.isBlank(allowConfSwapViaHttpStr))) {
			this.allowConfSwapViaHttp = "true"
					.equalsIgnoreCase(allowConfSwapViaHttpStr);
		}

		if (!(StringUtils.isBlank(confReloadCheckIntervalStr))) {
			this.confReloadCheckInterval = (1000 * NumberUtils
					.stringToInt(confReloadCheckIntervalStr));

			if (this.confReloadCheckInterval < 0) {
				this.confReloadCheckEnabled = false;
				log.info("conf reload check disabled");
			} else if (this.confReloadCheckInterval == 0) {
				this.confReloadCheckEnabled = true;
				log.info("conf reload check performed each request");
			} else {
				this.confReloadCheckEnabled = true;
				log.info("conf reload check set to "
						+ (this.confReloadCheckInterval / 1000) + "s");
			}
		} else {
			this.confReloadCheckEnabled = false;
		}

		String modRewriteConf = filterConfig.getInitParameter("modRewriteConf");
		if (!(StringUtils.isBlank(modRewriteConf))) {
			this.modRewriteStyleConf = "true".equals(StringUtils.trim(
					modRewriteConf).toLowerCase());
		}

		if (!(StringUtils.isBlank(confPathStr)))
			this.confPath = StringUtils.trim(confPathStr);
		else {
			this.confPath = ((this.modRewriteStyleConf) ? "/WEB-INF/.htaccess"
					: "/WEB-INF/urlrewrite.xml");
		}
		log.debug("confPath set to " + this.confPath);

		if ((statusEnabledConf != null) && (!("".equals(statusEnabledConf)))) {
			log.debug("statusEnabledConf set to " + statusEnabledConf);
			this.statusEnabled = "true".equals(statusEnabledConf.toLowerCase());
		}
		if (this.statusEnabled) {
			if ((statusPathConf != null) && (!("".equals(statusPathConf)))) {
				this.statusPath = statusPathConf.trim();
				log.info("status display enabled, path set to "
						+ this.statusPath);
			}
		} else
			log.info("status display disabled");

		if (StringUtils.isBlank(statusEnabledOnHosts))
			statusEnabledOnHosts = "localhost, local, 127.0.0.1";
		else {
			log.debug("statusEnabledOnHosts set to " + statusEnabledOnHosts);
		}
		this.statusServerNameMatcher = new ServerNameMatcher(
				statusEnabledOnHosts);

		String modRewriteConfText = filterConfig
				.getInitParameter("modRewriteConfText");
		if (!(StringUtils.isBlank(modRewriteConfText))) {
			ModRewriteConfLoader loader = new ModRewriteConfLoader();
			Conf conf = new Conf();
			loader.process(modRewriteConfText, conf);
			conf.initialise();
			checkConf(conf);
			this.confLoadedFromFile = false;
		} else {
			loadUrlRewriter(filterConfig);
		}
	}

	protected void loadUrlRewriter(FilterConfig filterConfig)
			throws ServletException {
		try {
			loadUrlRewriterLocal();
		} catch (Throwable e) {
			log.error(e);
			throw new ServletException(e);
		}
	}

	private void loadUrlRewriterLocal() {
		InputStream inputStream = this.context
				.getResourceAsStream(this.confPath);
		
		if (inputStream == null) {
			inputStream = ClassLoader.getSystemResourceAsStream(this.confPath);
		}
		/* begin added by whummer: */
		if (inputStream == null) {
			/* this is necessary because we package all resources into a single
			 * JAR file. The original approach (see above) only finds resources from 
			 * src/main/webapp 
			 * but does not find resources copied from 
			 * src/main/resources */
			inputStream = getClass().getResourceAsStream(this.confPath);
		}
		/* end added by whummer */
		URL confUrl = null;
		try {
			confUrl = this.context.getResource(this.confPath);
		} catch (MalformedURLException e) {
			log.debug(e);
		}
		String confUrlStr = null;
		if (confUrl != null) {
			confUrlStr = confUrl.toString();
		}
		if (inputStream == null) {
			log.error("unable to find urlrewrite conf file at " + this.confPath);

			if (this.urlRewriter != null) {
				log.error("unloading existing conf");
				this.urlRewriter = null;
			}
		} else {
			Conf conf = new Conf(this.context, inputStream, this.confPath,
					confUrlStr, this.modRewriteStyleConf);
			checkConf(conf);
		}
	}

	protected void checkConf(Conf conf) {
		checkConfLocal(conf);
	}

	private void checkConfLocal(Conf conf) {
		if (log.isDebugEnabled()) {
			if (conf.getRules() != null) {
				log.debug("inited with " + conf.getRules().size() + " rules");
			}
			log.debug("conf is " + ((conf.isOk()) ? "ok" : "NOT ok"));
		}
		this.confLastLoaded = conf;
		if ((conf.isOk()) && (conf.isEngineEnabled())) {
			this.urlRewriter = new UrlRewriter(conf);
			log.info("loaded (conf ok)");
		} else {
			if (!(conf.isOk())) {
				log.error("Conf failed to load");
			}
			if (!(conf.isEngineEnabled())) {
				log.error("Engine explicitly disabled in conf");
			}
			if (this.urlRewriter != null) {
				log.error("unloading existing conf");
				this.urlRewriter = null;
			}
		}
	}

	public void destroy() {
		log.info("destroy called");
		destroyActual();
		Log.resetAll();
	}

	public void destroyActual() {
		destroyUrlRewriter();
		this.context = null;
		this.confLastLoad = 0L;
		this.confPath = "/WEB-INF/urlrewrite.xml";
		this.confReloadCheckEnabled = false;
		this.confReloadCheckInterval = 0;
		this.confReloadInProgress = false;
	}

	protected void destroyUrlRewriter() {
		if (this.urlRewriter != null) {
			this.urlRewriter.destroy();
			this.urlRewriter = null;
		}
	}

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain chain) throws IOException, ServletException {
		UrlRewriter urlRewriter = getUrlRewriter(request, response, chain);

		HttpServletRequest hsRequest = (HttpServletRequest) request;
		HttpServletResponse hsResponse = (HttpServletResponse) response;
		UrlRewriteWrappedResponse urlRewriteWrappedResponse = new UrlRewriteWrappedResponse(
				hsResponse, hsRequest, urlRewriter);

		if ((this.statusEnabled)
				&& (this.statusServerNameMatcher.isMatch(request
						.getServerName()))) {
			String uri = hsRequest.getRequestURI();
			if (log.isDebugEnabled()) {
				log.debug("checking for status path on " + uri);
			}
			String contextPath = hsRequest.getContextPath();
			if ((uri != null)
					&& (uri.startsWith(contextPath + this.statusPath))) {
				showStatus(hsRequest, urlRewriteWrappedResponse);
				return;
			}
		}

		boolean requestRewritten = false;
		if (urlRewriter != null) {
			requestRewritten = urlRewriter.processRequest(hsRequest,
					urlRewriteWrappedResponse, chain);
		} else if (log.isDebugEnabled()) {
			log.debug("urlRewriter engine not loaded ignoring request (could be a conf file problem)");
		}

		if (!(requestRewritten))
			chain.doFilter(hsRequest, urlRewriteWrappedResponse);
	}

	protected UrlRewriter getUrlRewriter(ServletRequest request,
			ServletResponse response, FilterChain chain) {
		if (isTimeToReloadConf()) {
			reloadConf();
		}
		return this.urlRewriter;
	}

	public boolean isTimeToReloadConf() {
		if (!(this.confLoadedFromFile))
			return false;
		long now = System.currentTimeMillis();
		return ((this.confReloadCheckEnabled) && (!(this.confReloadInProgress)) && (now
				- this.confReloadCheckInterval > this.confReloadLastCheck));
	}

	public void reloadConf() {
		long now = System.currentTimeMillis();
		this.confReloadInProgress = true;
		this.confReloadLastCheck = now;

		log.debug("starting conf reload check");
		long confFileCurrentTime = getConfFileLastModified();
		if (this.confLastLoad < confFileCurrentTime) {
			this.confLastLoad = System.currentTimeMillis();
			log.info("conf file modified since last load, reloading");
			try {
				loadUrlRewriterLocal();
			} catch (Exception ex) {
				log.error(
						"Error in reloading the conf file. No rules to be applied for subsequent requests.",
						ex);
			}
		} else {
			log.debug("conf is not modified");
		}
		this.confReloadInProgress = false;
	}

	private long getConfFileLastModified() {
		if (this.context != null) {
			String realPath = this.context.getRealPath(this.confPath);
			if (realPath != null) {
				File confFile = new File(
						this.context.getRealPath(this.confPath));
				return confFile.lastModified();
			}
		}
		return INITIALISED_TIME;
	}

	private void showStatus(HttpServletRequest request, ServletResponse response)
			throws IOException {
		log.debug("showing status");

		if (this.allowConfSwapViaHttp) {
			String newConfPath = request.getParameter("conf");
			if (!(StringUtils.isBlank(newConfPath))) {
				this.confPath = newConfPath;
				loadUrlRewriterLocal();
			}
		}

		Status status = new Status(this.confLastLoaded, this);
		status.displayStatusInContainer(request);

		response.setContentType("text/html; charset=UTF-8");
		response.setContentLength(status.getBuffer().length());

		PrintWriter out = response.getWriter();
		out.write(status.getBuffer().toString());
		out.close();
	}

	public boolean isConfReloadCheckEnabled() {
		return this.confReloadCheckEnabled;
	}

	public int getConfReloadCheckInterval() {
		return (this.confReloadCheckInterval / 1000);
	}

	public Date getConfReloadLastCheck() {
		return new Date(this.confReloadLastCheck);
	}

	public boolean isStatusEnabled() {
		return this.statusEnabled;
	}

	public String getStatusPath() {
		return this.statusPath;
	}

	public boolean isLoaded() {
		return (this.urlRewriter != null);
	}

	public static String getFullVersionString() {
		Properties props = new Properties();
		String buildNumberStr = "";
		try {
			InputStream is = UrlRewriteFilter.class
					.getResourceAsStream("build.number.properties");
			if (is != null) {
				props.load(is);
				String buildNumber = (String) props.get("build.number");
				if (!(StringUtils.isBlank(buildNumber)))
					buildNumberStr = props.get("project.version") + " build "
							+ props.get("build.number");
			}
		} catch (IOException e) {
			log.error(e);
		}
		return buildNumberStr;
	}
}