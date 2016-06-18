package io.riox.cloud.stream.module.csvenricher;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

/**
 * @author Oliver Moser
 */
@Configuration
@EnableConfigurationProperties(CsvEnricherProperties.class)
@Slf4j
public class CsvEnricherConfiguration {

	@Autowired
	CsvEnricherProperties properties;

	@PostConstruct
	public void dumpConfig() {
		log.info("---------------------------------------------------------");
		log.info("           csv-enricher-processor config     ");
		log.info("");
		log.info("csv.location:   {}", properties.getLocation());
		log.info("csv.sourceID:   {}", properties.getSourceID());
		log.info("csv.targetID:   {}", properties.getTargetID());
		log.info("csv.cache:      {}", properties.getCache());
		log.info("csv.mappings:   {}", properties.getMappings());
		log.info("csv.columns:    {}", properties.getColumns());
		log.info("---------------------------------------------------------");
	}


}
