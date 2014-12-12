package io.riots.services.catalog;

import static org.elasticsearch.node.NodeBuilder.nodeBuilder;
import io.riots.core.boot.ServiceStarter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.elasticsearch.core.ElasticsearchTemplate;
import org.springframework.data.elasticsearch.repository.config.EnableElasticsearchRepositories;

/**
 * @author riox
 */
@EnableElasticsearchRepositories(
        basePackages = {"io.riots.catalog.repositories"},
        excludeFilters = @ComponentScan.Filter(
        	                type = FilterType.REGEX,
        	                pattern = "io\\.riots\\.core\\.repositories\\.BaseObjectRepository")
)
public class ElasticSearchEnabledServiceStarter extends ServiceStarter {

    @Bean
    public ElasticsearchTemplate elasticsearchTemplate() throws Exception {
        return new ElasticsearchTemplate(nodeBuilder().local(true).node().client());
    }

}
