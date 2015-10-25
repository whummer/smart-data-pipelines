package io.riox.cloud.stream.module.splitter;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Module options for the {@code splitter} processor module
 *
 * @author Waldemar Hummer
 */
@ConfigurationProperties
public class SplitterProcessorProperties {

	/**
	 * Mapping in the form <fieldNameRegex>:<targetNameField>:<targetValueField>
	 *
	 * For instance, the following mapping:
	 *
	 * MBA.*:shortName:waitingTime
	 *
	 * ... would turn this document:
	 *
	 * {"MBA1":0,"MBA2":2,"MBA3":5,"IsOpen":false,"Timestamp":"14:07"}
	 *
	 * ... into an array of documents:
	 * [
	 *  {"shortName":"MBA1","waitingTime":0,"IsOpen":false,"Timestamp":"14:07"},
	 *  {"shortName":"MBA2","waitingTime":2,"IsOpen":false,"Timestamp":"14:07"},
	 *  {"shortName":"MBA3","waitingTime":5,"IsOpen":false,"Timestamp":"14:07"}
	 * ]
	 */
	private String mapping;

	public String getMapping() {
		return mapping;
	}
	public void setMapping(String mapping) {
		this.mapping = mapping;
	}

}
