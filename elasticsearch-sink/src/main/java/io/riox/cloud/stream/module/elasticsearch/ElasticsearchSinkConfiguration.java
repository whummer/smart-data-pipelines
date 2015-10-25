package io.riox.cloud.stream.module.elasticsearch;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.client.Client;
import org.elasticsearch.client.transport.TransportClient;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.transport.InetSocketTransportAddress;
import org.elasticsearch.common.transport.TransportAddress;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.Assert;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.apache.commons.lang3.StringUtils.split;
import static org.elasticsearch.common.settings.ImmutableSettings.settingsBuilder;
import static org.elasticsearch.node.NodeBuilder.nodeBuilder;


/**
 * @author Oliver Moser
 */
@Configuration
@EnableConfigurationProperties(ElasticsearchSinkProperties.class)
@Slf4j
public class ElasticsearchSinkConfiguration {

	@Autowired
	private ElasticsearchSinkProperties properties;

	@PostConstruct
	public void dumpConfig() {
		log.info("---------------------------------------------------------");
		log.info("     elasticsearch-sink config     ");
		log.info("");
		log.info("es.mode:        {}", properties.getMode());
		log.info("es.clusterName: {}", properties.getClusterName());
		log.info("es.index:       {}", properties.getIndex());
		log.info("es.type:        {}", properties.getType());
		log.info("es.dataPath:    {}", properties.getDataPath());
		log.info("es.hosts:       {}", properties.getHosts());
		log.info("es.idPath:      {}", properties.getIdPath());
		log.info("---------------------------------------------------------");
	}

	@Bean(name = "elasticsearchClient")
	@ConditionalOnProperty(name = "es.mode", havingValue = "transport")
	public Client transportClient() throws Exception {
		log.info("Creating new transport client for hosts: {}", properties.getHosts());
		Settings settings = settingsBuilder()
				.put("client.transport.ignore_cluster_name", true).build();
		TransportClient client = new TransportClient(settings).addTransportAddresses(getTransportAddresses());
		client.connectedNodes();
		return client;
	}

	@Bean(name = "elasticsearchClient")
	@ConditionalOnProperty(name="es.mode", havingValue = "node")
	public Client nodeClient() throws Exception {
		log.info("Creating new node client for cluster {}", properties.getClusterName());
		return nodeBuilder().clusterName(properties.getClusterName()).node().client();
	}

	private TransportAddress[] getTransportAddresses() {
		List<String> hosts = Arrays.asList(split(properties.getHosts(), ","));
		List<TransportAddress> addresses = new ArrayList<>();
		for (String host : hosts) {
			String hostName = StringUtils.substringBefore(host, ":");
			String port = StringUtils.substringAfter(host, ":");
			Assert.hasText(hostName, "Missing host name in '--es.hosts'");
			Assert.hasText(port, "Missing port in '--es.hosts'");
			addresses.add(new InetSocketTransportAddress(hostName, Integer.valueOf(port)));
		}

		return addresses.toArray(new TransportAddress[hosts.size()]);
	}

}
