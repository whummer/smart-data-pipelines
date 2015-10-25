package io.riox.cloud.stream.module.elasticsearch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchAutoConfiguration;
import org.springframework.boot.autoconfigure.elasticsearch.ElasticsearchDataAutoConfiguration;

/**
 * @author Oliver Moser
 */
@SpringBootApplication
@EnableAutoConfiguration(exclude = {ElasticsearchDataAutoConfiguration.class, ElasticsearchAutoConfiguration.class})
public class ElasticsearchSinkApplication {

	public static void main(String[] args) {
		SpringApplication.run(ElasticsearchSinkApplication.class, args);
	}

}
