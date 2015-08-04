package io.riots.boot.health;

import org.elasticsearch.action.ActionFuture;
import org.elasticsearch.action.admin.cluster.health.ClusterHealthStatus;
import org.elasticsearch.action.admin.cluster.stats.ClusterStatsRequest;
import org.elasticsearch.action.admin.cluster.stats.ClusterStatsResponse;
import org.elasticsearch.client.transport.TransportClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.AbstractHealthIndicator;
import org.springframework.boot.actuate.health.Health;

import java.util.concurrent.TimeUnit;

/**
 * Created by omoser on 19/01/15.
 *
 * @author omoser
 */
public class ElasticsearchHealthIndicator extends AbstractHealthIndicator {

    @Autowired
    TransportClient client;

    @Override
    protected void doHealthCheck(Health.Builder builder) throws Exception {
        ClusterStatsRequest request = new ClusterStatsRequest();
        ActionFuture<ClusterStatsResponse> response = client.admin().cluster().clusterStats(request);
        ClusterStatsResponse clusterStatus = response.get(2500, TimeUnit.MILLISECONDS);
        ClusterHealthStatus overallStatus = clusterStatus.getStatus();
        switch (overallStatus) {
            case GREEN:
                builder.up();
                break;
            case YELLOW:
                builder.up().withDetail("clusterstatus", clusterStatus.toString());
                break;
            case RED:
                builder.down();
                break;
            default:
                builder.down();
        }

    }
}
