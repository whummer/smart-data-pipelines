package io.riox.cloud.stream.module.csvenricher;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author Oliver Moser
 */
@Configuration
@EnableConfigurationProperties(CsvEnricherProperties.class)
public class CsvEnricherConfiguration {

}
