package io.riox.cloud.stream.module.elasticsearch;

import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.elasticsearch.client.Client;
import org.elasticsearch.common.settings.Settings;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.UUID;

import static org.elasticsearch.common.settings.ImmutableSettings.settingsBuilder;
import static org.elasticsearch.node.NodeBuilder.nodeBuilder;

/**
 * @author Oliver Moser
 */
@Configuration
@EnableConfigurationProperties(ElasticsearchSinkProperties.class)
@Slf4j
public class ElasticsearchSinkNodeModeTestConfiguration {

	@Autowired
	private ElasticsearchSinkProperties properties;

	@Bean(name = "elasticsearchClient")
	public Client nodeClient() throws Exception {
		String dataDir = FileUtils.getTempDirectoryPath() + UUID.randomUUID().toString();
		log.info("Creating test ES client with dataDir '{}'", dataDir);
		System.setProperty("es.dataPath", dataDir);
		Settings settings = settingsBuilder().put("path.data", dataDir).build();
		return nodeBuilder().settings(settings).clusterName(properties.getClusterName()).node().client();
	}
}
