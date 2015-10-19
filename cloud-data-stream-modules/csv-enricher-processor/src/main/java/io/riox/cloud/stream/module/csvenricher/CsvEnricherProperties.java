package io.riox.cloud.stream.module.csvenricher;

import lombok.Data;
import org.hibernate.validator.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;

import javax.validation.constraints.NotNull;


/**
 * Module options for the {@code enricher} processor module
 *
 * @author Waldemar Hummer
 * @author Oliver Moser
 */
@ConfigurationProperties(prefix = "csv")
@Data
public class CsvEnricherProperties {

	private int cache = -1;

	private boolean overwrite = false;

	private boolean flat = true;

	private String location;

	private String columns;

	private String sourceID;

	private String targetID;

	private String mappings;

	@NotBlank(message = "You need to provide the CSV reference via '--csv.location'")
	public String getLocation() {
		return location;
	}
}
