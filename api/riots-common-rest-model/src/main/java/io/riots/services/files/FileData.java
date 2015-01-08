package io.riots.services.files;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;

public class FileData {
	
	@JsonProperty("image-base64")		
	private String imageBase64;
	
	@JsonIgnore
	private byte[] data;
	
	@JsonProperty("content-type")		
	private String contentType;
	
	public FileData() { }
	
	public FileData(String contentType, byte[] data) {
		this.setContentType(contentType);
		this.setData(data);
	}

	public byte[] getData() {
		return data;
	}

	public String getContentType() {
		return contentType;
	}

	public void setContentType(String contentType) {
		this.contentType = contentType;
	}

	public void setData(byte[] data) {
		this.data = data;
	}

	public String getImageBase64() {
		return imageBase64;
	}

	public void setImageBase64(String imageBase64) {
		this.imageBase64 = imageBase64;
	}
	
}