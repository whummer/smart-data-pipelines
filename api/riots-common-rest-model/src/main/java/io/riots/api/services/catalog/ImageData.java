package io.riots.api.services.catalog;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;
import com.fasterxml.jackson.annotation.JsonProperty;

public class ImageData {

    @JsonInclude(Include.NON_EMPTY)
    @JsonProperty("id")
    private String id;

    @JsonInclude(Include.NON_EMPTY)
    @JsonProperty("content-type")
    private String contentType;

    @JsonInclude(Include.NON_EMPTY)
    @JsonProperty("href")
    private String href;

    @JsonInclude(Include.NON_EMPTY)
    @JsonProperty("base64-string")   
    private String base64String;

    @JsonInclude(Include.NON_EMPTY)
    @JsonProperty("active")
    private boolean active;

    public ImageData() {
    }

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

    public ImageData withBase64String(final java.lang.String base64String) {
        setBase64String(base64String);
        return this;
    }


}