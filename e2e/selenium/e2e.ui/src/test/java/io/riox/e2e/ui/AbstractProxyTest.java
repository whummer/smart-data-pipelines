package io.riox.e2e.ui;

import io.netty.handler.codec.http.HttpRequest;
import io.netty.handler.codec.http.HttpResponse;
import net.lightbody.bmp.BrowserMobProxy;
import net.lightbody.bmp.BrowserMobProxyServer;
import net.lightbody.bmp.client.ClientUtil;
import net.lightbody.bmp.filters.RequestFilter;
import net.lightbody.bmp.util.HttpMessageContents;
import net.lightbody.bmp.util.HttpMessageInfo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.junit.BeforeClass;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

/**
 * This class setups a Proxy server that handles spoofs the host name
 * of the AWS load balancer to "platform.riox.io".
 *
 * @author riox
 */
public class AbstractProxyTest {

	protected static WebDriver driver = null;
	protected static String rioxUrl = null;
	protected static String fakeHost = null;
	protected Logger log = LoggerFactory.getLogger(getClass());


	@BeforeClass
	public static void beforeAll() {

		if (System.getProperty("webdriver.chrome.driver") == null) {
			System.out.println("Ensure 'chromedriver' binary' is in PATH or " +
//			throw new RuntimeException(
					" set the system property 'webdriver.chrome.driver' to the location of "
					+ "the chromedriver. You can download it from here:"
					+ " https://sites.google.com/a/chromium.org/chromedriver/ ");
		}

		rioxUrl = System.getProperty("riox.endpoint");
		if (rioxUrl == null) {
			throw new RuntimeException("Please specify the 'riox.endpoint' system property "
					+ "pointing to the Riox instance that you want to test.");
		}

		fakeHost = System.getProperty("riox.fakeHost");
		if (fakeHost == null) {
			fakeHost = "demo.riox.io";
		}

		if (!rioxUrl.startsWith("http://")) {
			rioxUrl = "http://" + rioxUrl;
		}


		// start the proxy
		BrowserMobProxy proxy = new BrowserMobProxyServer();
		proxy.start(0);

		// map host
		proxy.addRequestFilter(new RequestFilter() {
			public HttpResponse filterRequest(HttpRequest request,
					HttpMessageContents contents, HttpMessageInfo messageInfo) {
							 request.headers().set("Host", fakeHost);
							 return null;
			}
		});

		// get the Selenium proxy object
		Proxy proxy1 = ClientUtil.createSeleniumProxy(proxy);

		// configure it as a desired capability
		DesiredCapabilities capabilities = new DesiredCapabilities();
		capabilities.setCapability(CapabilityType.PROXY, proxy1);

		driver = new ChromeDriver(capabilities);
	}

	/**
	 * Whether Riox is pointint to our staging environment
	 */
	protected boolean isStagingEnv() {
		if ("staging".equalsIgnoreCase(System.getProperty("riox.env"))) {
			return true;
		}
		return false;
	}

}
