package io.riox.cloud.stream.module.csvenricher;

import lombok.Data;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;


/**
 * Module options for the {@code enricher} processor module
 *
 * @author Waldemar Hummer
 * @author Oliver Moser
 */
@ConfigurationProperties(prefix = "csv")
@Data
public class CsvEnricherProperties {

	private String url;

	private int cache = -1;

	private boolean overwrite = false;

	private boolean flat = true;

	private String columns;

	private String sourceID;

	private String targetID;

	private String mappings;

	@NotBlank
	public String getUrl() {
		return this.url;
	}
}
