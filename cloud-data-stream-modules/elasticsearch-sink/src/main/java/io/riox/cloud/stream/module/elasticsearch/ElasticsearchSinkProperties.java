package io.riox.cloud.stream.module.elasticsearch;

import lombok.Data;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.boot.autoconfigure.transaction.TransactionAutoConfiguration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

import javax.validation.constraints.AssertTrue;


/**
 * Module options for the {@code ElasticSearch} sink module
 *
 * @author Marius Bogoevici
 * @author Oliver Moser
 */
@ConfigurationProperties(prefix = "es")
@Data
public class ElasticsearchSinkProperties {

	private String mode;

	private String hosts = "localhost:9300";

	private String index;

	private String type;

	private String idPath;

	private String clusterName;

	private String dataPath;

	@NotBlank(message = "You have to provide the Elasticsearch index using '--es.index=someIndex'")
	public String getIndex() {
		return index;
	}

	@NotBlank(message = "You have to provide the Elasticsearch type using '--es.type=someDocumentType'")
	public String getType() {
		return type;
	}

	@NotBlank(message = "You have to provide '--es.mode' with either 'node' or 'transport'")
	public String getMode() {
		return mode;
	}

	@AssertTrue(message = "When using es.mode='node' you have to provide '--es.cluster=myCluster'")
	public boolean validateNodeModeSettings() {
		return "node".equals(mode) || !StringUtils.isEmpty(clusterName);
	}

	@AssertTrue(message = "When using es.mode='transport' you have to provide '--es.hosts=hostA:portA,hostB:portB'")
	public boolean validateTransportModeSettings() {
		return "transport".equals(mode) || !StringUtils.isEmpty(hosts);
	}


	@AssertTrue(message = "Only 'node' and 'transport' are valid for '--es.mode'")
	public boolean validateMode() {
		return "node".equals(mode) || "transport".equals(mode);
	}
}
