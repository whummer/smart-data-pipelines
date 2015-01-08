package io.riots.services.catalog;

import static org.springframework.data.elasticsearch.annotations.FieldType.Boolean;
import static org.springframework.data.elasticsearch.annotations.FieldType.String;

import org.springframework.data.elasticsearch.annotations.Field;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ImageData {
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("id")	
	@Field(type = String)
	private String id;
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("content-type")	
	@Field(type = String)
	private String contentType;
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("href")
	@Field(type = String)
	private String href;
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("base64-string")
	private String base64String;
	
	@JsonInclude(Include.NON_EMPTY)
	@JsonProperty("active")
	@Field(type = Boolean)

	private boolean active;
	
	public ImageData() {}
	
	public void setId(String id) {
		this.id = id;
	}
	
	public String getId() {
		return id;
	}
	
	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public String getHref() {
		return href;
	}

	public void setHref(String href) {
		this.href = href;
	}

	public String getBase64String() {
		return base64String;
	}

	public void setBase64String(String base64String) {
		this.base64String = base64String;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}
	
	public ImageData withContentType(String contentType) {
		this.setContentType(contentType);
		return this;
	}
	
	public ImageData withHref(String href) {
		this.setHref(href);
		return this;
	}

	
	
}
