//package io.riots.api.services;
//
//import java.io.IOException;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.concurrent.atomic.AtomicBoolean;
//import java.util.concurrent.atomic.AtomicLong;
//
//import javax.servlet.ServletException;
//import javax.servlet.http.HttpServletRequest;
//import javax.servlet.http.HttpServletResponse;
//
//import org.eclipse.jetty.server.Request;
//import org.eclipse.jetty.server.Server;
//import org.eclipse.jetty.server.handler.AbstractHandler;
//import org.springframework.stereotype.Component;
//import org.testng.Assert;
//
//import com.netflix.appinfo.AbstractEurekaIdentity;
//import com.netflix.appinfo.EurekaClientIdentity;
//import com.netflix.appinfo.InstanceInfo;
//import com.netflix.discovery.converters.XmlXStream;
//import com.netflix.discovery.shared.Application;
//import com.netflix.discovery.shared.Applications;
//
///**
// * @author Nitesh Kant
// * @author riox
// */
//@Component
//public class MockRemoteEurekaServer {
//
//    public static final String EUREKA_API_BASE_PATH = "/eureka/v2/";
//
//    private int port;
//    private final Map<String, Application> applicationMap        = new HashMap<String, Application>();
//    private final Map<String, Application> remoteRegionApps      = new HashMap<String, Application>();
//    private final Map<String, Application> remoteRegionAppsDelta = new HashMap<String, Application>();
//    private final Map<String, Application> applicationDeltaMap   = new HashMap<String, Application>();
//    private Server server;
//    private final AtomicBoolean sentDelta = new AtomicBoolean();
//    private final AtomicBoolean sentRegistry = new AtomicBoolean();
//
//    public AtomicLong heartbeatCount = new AtomicLong(0);
//    public AtomicLong getFullRegistryCount = new AtomicLong(0);
//    public AtomicLong getSingleVipCount = new AtomicLong(0);
//    public AtomicLong getDeltaCount = new AtomicLong(0);
//    
//    public MockRemoteEurekaServer() {
//    	
//    }
//
//    public void start() throws Exception {
//        server = new Server(port);
//        server.setHandler(new AppsResourceHandler());
//        server.start();
//        port = server.getConnectors()[0].getLocalPort();
//    }
//
//    public int getPort() {
//        return port;
//    }
//    
//    public void stop() throws Exception {
//        server.stop();
//        server = null;
//        port = 0;
//        
//        applicationMap.clear();
//        remoteRegionApps.clear();
//        remoteRegionAppsDelta.clear();
//        applicationDeltaMap.clear();
//    }
//
//    public boolean isSentDelta() {
//        return sentDelta.get();
//    }
//
//    public boolean isSentRegistry() {
//        return sentRegistry.get();
//    }
//
//    public void addRemoteRegionApps(String appName, Application app) {
//        remoteRegionApps.put(appName, app);
//    }
//
//    public void addRemoteRegionAppsDelta(String appName, Application app) {
//        remoteRegionAppsDelta.put(appName, app);
//    }
//
//    public void addLocalRegionApps(String appName, Application app) {
//        applicationMap.put(appName, app);
//    }
//
//    public void addLocalRegionAppsDelta(String appName, Application app) {
//        applicationDeltaMap.put(appName, app);
//    }
//
//    public void waitForDeltaToBeRetrieved(int refreshRate) throws InterruptedException {
//        int count = 0;
//        while (count++ < 3 && !isSentDelta()) {
//            System.out.println("Sleeping for " + refreshRate + " seconds to let the remote registry fetch delta. Attempt: " + count);
//            Thread.sleep( 3 * refreshRate * 1000);
//            System.out.println("Done sleeping for 10 seconds to let the remote registry fetch delta. Delta fetched: " + isSentDelta());
//        }
//
//        System.out.println("Sleeping for extra " + refreshRate + " seconds for the client to update delta in memory.");
//    }
//
//    //
//    // A base default resource handler for the mock server
//    //
//    private class AppsResourceHandler extends AbstractHandler {
//
//      
//      	@Override
//				public void handle(String target, Request arg1, HttpServletRequest request,
//						HttpServletResponse response) throws IOException, ServletException {
//            String authName = request.getHeader(AbstractEurekaIdentity.AUTH_NAME_HEADER_KEY);
//            String authVersion = request.getHeader(AbstractEurekaIdentity.AUTH_VERSION_HEADER_KEY);
//            String authId = request.getHeader(AbstractEurekaIdentity.AUTH_ID_HEADER_KEY);
//
//            Assert.assertEquals(EurekaClientIdentity.DEFAULT_CLIENT_NAME, authName);
//            Assert.assertNotNull(authVersion);
//            Assert.assertNotNull(authId);
//
//            String pathInfo = request.getPathInfo();
//            System.out.println("Eureka port: " + port + ". " + System.currentTimeMillis() +
//                    ". Eureka resource mock, received request on path: " + pathInfo + ". HTTP method: |"
//                    + request.getMethod() + '|' + ", query string: " + request.getQueryString());
//            boolean handled = false;
//            if (null != pathInfo && pathInfo.startsWith("")) {
//                pathInfo = pathInfo.substring(EUREKA_API_BASE_PATH.length());
//                boolean includeRemote = isRemoteRequest(request);
//
//                if (pathInfo.startsWith("applications/delta")) {
//                    getDeltaCount.getAndIncrement();
//
//                    Applications applications = new Applications();
//                    applications.setVersion(100L);
//                    if (sentDelta.compareAndSet(false, true)) {
//                        addDeltaApps(includeRemote, applications);
//                    } else {
//                        System.out.println("Eureka port: " +  port + ". " + System.currentTimeMillis() +". Not including delta as it has already been sent.");
//                    }
//                    applications.setAppsHashCode(getDeltaAppsHashCode(includeRemote));
//                    sendOkResponseWithContent((Request) request, response, applications);
//                    handled = true;
//                } else if(pathInfo.equals("applications/")) {
//                    getFullRegistryCount.getAndIncrement();
//
//                    Applications applications = new Applications();
//                    applications.setVersion(100L);
//                    for (Application application : applicationMap.values()) {
//                        applications.addApplication(application);
//                    }
//                    if (includeRemote) {
//                        for (Application application : remoteRegionApps.values()) {
//                            applications.addApplication(application);
//                        }
//                    }
//
//                    if (sentDelta.get()) {
//                        addDeltaApps(includeRemote, applications);
//                    } else {
//                        System.out.println("Eureka port: " + port + ". " + System.currentTimeMillis() +". Not including delta applications in /applications response, as delta has not been sent.");
//                    }
//                    applications.setAppsHashCode(applications.getReconcileHashCode());
//                    sendOkResponseWithContent((Request) request, response, applications);
//                    sentRegistry.set(true);
//                    handled = true;
//                } else if (pathInfo.startsWith("vips/")) {
//                    getSingleVipCount.getAndIncrement();
//
//                    String vipAddress = pathInfo.substring("vips/".length());
//                    Applications applications = new Applications();
//                    applications.setVersion(-1l);
//                    for (Application application : applicationMap.values()) {
//                        Application retApp = new Application(application.getName());
//                        for (InstanceInfo instance : application.getInstances()) {
//                            if (vipAddress.equals(instance.getVIPAddress())) {
//                                retApp.addInstance(instance);
//                            }
//                        }
//
//                        if (retApp.getInstances().size() > 0) {
//                            applications.addApplication(retApp);
//                        }
//                    }
//
//                    applications.setAppsHashCode(applications.getReconcileHashCode());
//                    sendOkResponseWithContent((Request) request, response, applications);
//                    handled = true;
//                } else if (pathInfo.startsWith("applications")) {  // assume this is the renewal heartbeat
//                    heartbeatCount.getAndIncrement();
//
//                    sendOkResponseWithContent((Request) request, response, new Applications());
//                } else {
//                    System.out.println("Not handling request: " + pathInfo);
//                }
//            }
//
//            if(!handled) {
//                response.sendError(HttpServletResponse.SC_NOT_FOUND,
//                        "Request path: " + pathInfo + " not supported by eureka resource mock.");
//            }
//        }
//
//        protected void addDeltaApps(boolean includeRemote, Applications applications) {
//            for (Application application : applicationDeltaMap.values()) {
//                applications.addApplication(application);
//            }
//            if (includeRemote) {
//                for (Application application : remoteRegionAppsDelta.values()) {
//                    applications.addApplication(application);
//                }
//            }
//        }
//
//        protected String getDeltaAppsHashCode(boolean includeRemote) {
//            Applications allApps = new Applications();
//            for (Application application : applicationMap.values()) {
//                allApps.addApplication(application);
//            }
//
//            if (includeRemote) {
//                for (Application application : remoteRegionApps.values()) {
//                    allApps.addApplication(application);
//                }
//            }
//            addDeltaApps(includeRemote, allApps);
//            return allApps.getReconcileHashCode();
//        }
//
//        protected boolean isRemoteRequest(HttpServletRequest request) {
//            String queryString = request.getQueryString();
//            if (queryString == null) {
//                return false;
//            }
//            return queryString.contains("regions=");
//        }
//
//        protected void sendOkResponseWithContent(Request request, HttpServletResponse response, Applications applications)
//                throws IOException {
//            String content = XmlXStream.getInstance().toXML(applications);
//            response.setContentType("application/xml");
//            response.setStatus(HttpServletResponse.SC_OK);
//            response.getWriter().println(content);
//            response.getWriter().flush();
//            request.setHandled(true);
//            System.out.println("Eureka port: " + port + ". " + System.currentTimeMillis() +
//                    ". Eureka resource mock, sent response for request path: " + request.getPathInfo() +
//                    ", applications count: " + applications.getRegisteredApplications().size());
//        }
//
//        protected void sleep(int seconds) {
//            try {
//                Thread.sleep(seconds);
//            } catch (InterruptedException e) {
//                System.out.println("Interrupted: " + e);
//            }
//        }
//			
//    }
//}