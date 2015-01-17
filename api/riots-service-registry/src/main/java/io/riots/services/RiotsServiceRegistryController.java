package io.riots.services;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.netflix.appinfo.AmazonInfo;
import com.netflix.appinfo.DataCenterInfo;
import com.netflix.appinfo.InstanceInfo;
import com.netflix.discovery.shared.Application;
import com.netflix.discovery.shared.Pair;
import com.netflix.eureka.PeerAwareInstanceRegistry;
import com.netflix.eureka.resources.StatusResource;
import com.netflix.eureka.util.StatusInfo;
import org.springframework.cloud.netflix.eureka.server.EurekaController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

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

   /* @JsonIgnoreProperties(ignoreUnknown = true)
    static final class Health {

        String status;

        DiskSpace diskSpace;

        MongoHealth mongoHealth;

        ElasticHealth elasticHealth;

        HystrixHealth hystrixHealth;


        private class DiskSpace {
            String status;

            long free;
        }

        private class MongoHealth {

            String status;

            String errorText;
        }

        private class ElasticHealth {

            String status;

            String errorText
        }

        private class HystrixHealth {
        }
    }*/


    /*private void populateApps(Map<String, Object> model) {
        List<Application> sortedApplications = PeerAwareInstanceRegistry.getInstance().getSortedApplications();
        ArrayList<Map<String, Object>> apps = new ArrayList<>();
        for (Application app : sortedApplications) {
            LinkedHashMap<String, Object> appData = new LinkedHashMap<>();
            apps.add(appData);
            appData.put("name", app.getName());
            Map<String, Integer> amiCounts = new HashMap<>();
            Map<InstanceInfo.InstanceStatus, List<Pair<String, String>>> instancesByStatus = new HashMap<>();
            Map<String, Integer> zoneCounts = new HashMap<>();
            for (InstanceInfo info : app.getInstances()) {
                String id = info.getId();
                String url = info.getStatusPageUrl();
                InstanceInfo.InstanceStatus status = info.getStatus();
                String ami = "n/a";
                String zone = "";
                if (info.getDataCenterInfo().getName() == DataCenterInfo.Name.Amazon) {
                    AmazonInfo dcInfo = (AmazonInfo) info.getDataCenterInfo();
                    ami = dcInfo.get(AmazonInfo.MetaDataKey.amiId);
                    zone = dcInfo.get(AmazonInfo.MetaDataKey.availabilityZone);
                }

                Integer count = amiCounts.get(ami);
                if (count != null) {
                    amiCounts.put(ami, count + 1);
                } else {
                    amiCounts.put(ami, 1);
                }

                count = zoneCounts.get(zone);
                if (count != null) {
                    zoneCounts.put(zone, count + 1);
                } else {
                    zoneCounts.put(zone, 1);
                }

                List<Pair<String, String>> list = instancesByStatus.get(status);
                if (list == null) {
                    list = new ArrayList<>();
                    instancesByStatus.put(status, list);
                }
                list.add(new Pair<>(id, url));
            }
            appData.put("amiCounts", amiCounts.entrySet());
            appData.put("zoneCounts", zoneCounts.entrySet());
            ArrayList<Map<String, Object>> instanceInfos = new ArrayList<>();
            appData.put("instanceInfos", instanceInfos);
            boolean somethingDown = false;
            for (Map.Entry<InstanceInfo.InstanceStatus, List<Pair<String, String>>> entry : instancesByStatus.entrySet()) {
                List<Pair<String, String>> value = entry.getValue();
                InstanceInfo.InstanceStatus status = entry.getKey();
                LinkedHashMap<String, Object> instanceData = new LinkedHashMap<>();
                instanceInfos.add(instanceData);
                instanceData.put("status", entry.getKey());
                ArrayList<Map<String, Object>> instances = new ArrayList<>();
                instanceData.put("instances", instances);
                instanceData.put("isNotUp", status != InstanceInfo.InstanceStatus.UP);
                somethingDown = status != InstanceInfo.InstanceStatus.UP;
                for (Pair<String, String> p : value) {
                    LinkedHashMap<String, Object> instance = new LinkedHashMap<>();
                    instances.add(instance);
                    instance.put("id", p.first());
                    instance.put("infoUrl", getInfoUrl(p.second()));
                    instance.put("healthUrl", getHealthUrl(p.second()));
                    instance.put("insightUrl", getInsightUrl(p.second()));
                    instance.put("isHref", p.second().startsWith("http"));
                }
            }

            boolean everythingAlright = !somethingDown;

            appData.put("everythingAlright", everythingAlright);

        }
        model.put("apps", apps);
    }*/

   /* private String getInsightUrl(String urlFromEureka) {
        return getUrl(urlFromEureka, "/insight/index.html"); //todo remove index.html part later
    }

    private String getHealthUrl(String urlFromEureka) {
        return getUrl(urlFromEureka, "/health");
    }

    private String getInfoUrl(String urlFromEureka) {
        return getUrl(urlFromEureka, "/info");
    }

    private String getUrl(String urlFromEureka, String action) {
        UriComponents builder = UriComponentsBuilder.fromHttpUrl(urlFromEureka).build();
        return builder.getScheme() + "://" + builder.getHost() + ":" + builder.getPort() + action;
    }*/
}
