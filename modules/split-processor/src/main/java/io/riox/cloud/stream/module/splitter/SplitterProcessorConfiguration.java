package io.riox.cloud.stream.module.splitter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author Waldemar Hummer
 */
@Configuration
@EnableConfigurationProperties(SplitterProcessorProperties.class)
public class SplitterProcessorConfiguration {

	@Autowired
	SplitterProcessorProperties properties;

}
