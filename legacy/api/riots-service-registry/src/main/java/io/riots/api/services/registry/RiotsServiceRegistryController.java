package io.riots.api.services.registry;

import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.shared.Application;
import com.netflix.eureka.PeerAwareInstanceRegistry;
import com.netflix.eureka.resources.StatusResource;
import com.netflix.eureka.util.StatusInfo;
import org.springframework.cloud.netflix.eureka.server.EurekaController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * Created by omoser on 16/01/15.
 *
 * @author omoser
 */
public class RiotsServiceRegistryController extends EurekaController {

    @RequestMapping(method = RequestMethod.GET)
    public String status(HttpServletRequest request, Map<String, Object> model) {
        populateBase(request, model);
        populateApps(model);
        StatusInfo statusInfo = new StatusResource().getStatusInfo();
        model.put("statusInfo", statusInfo);
        return "eureka/status";
    }

    private void populateApps(Map<String, Object> model) {
        List<Application> sortedApplications = PeerAwareInstanceRegistry.getInstance().getSortedApplications();
        ArrayList<Map<String, Object>> apps = new ArrayList<>();

        for (Application app : sortedApplications) {
            LinkedHashMap<String, Object> appData = new LinkedHashMap<>();
            apps.add(appData);
            appData.put("name", app.getName());
            List<Map<String, String>> instances = new ArrayList<>();
            appData.put("instances", instances);
            boolean somethingDown = false;
            for (InstanceInfo info : app.getInstances()) {
                Map<String, String> instanceInfos = new HashMap<>();
                instanceInfos.put("id", info.getId());
                instanceInfos.put("instanceId", info.getMetadata().get("instanceId"));
                instanceInfos.put("statusPageUrl", info.getStatusPageUrl() + "/insight/index.html"); // todo remove this
                instanceInfos.put("homePageUrl", info.getHomePageUrl());
                instanceInfos.put("healthCheckUrl", info.getHealthCheckUrls() != null ? info.getHealthCheckUrls().toArray()[0].toString() : "N/A");
                instanceInfos.put("status", String.valueOf(info.getStatus()));
                instanceInfos.put("ok", String.valueOf(info.getStatus() == InstanceInfo.InstanceStatus.UP));
                instanceInfos.put("vipAddress", info.getVIPAddress());
                instanceInfos.put("lastUpdated", new Date(info.getLastUpdatedTimestamp()).toString());
                instanceInfos.put("hostname", info.getHostName());
                instanceInfos.put("port", String.valueOf(info.getPort()));
                somethingDown = info.getStatus() != InstanceInfo.InstanceStatus.UP;
                instances.add(instanceInfos);
            }

            appData.put("everythingAlright", !somethingDown);
        }

        model.put("apps", apps);
    }

}
