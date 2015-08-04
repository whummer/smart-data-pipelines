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

    @Override
    public String toString() {
        return "ImageData{" +
                "id='" + id + '\'' +
                ", contentType='" + contentType + '\'' +
                ", href='" + href + '\'' +
                ", base64String='" + base64String + '\'' +
                ", active=" + active +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        ImageData imageData = (ImageData) o;

        if (active != imageData.active) return false;
        if (base64String != null ? !base64String.equals(imageData.base64String) : imageData.base64String != null)
            return false;
        if (contentType != null ? !contentType.equals(imageData.contentType) : imageData.contentType != null)
            return false;
        if (href != null ? !href.equals(imageData.href) : imageData.href != null) return false;
        if (id != null ? !id.equals(imageData.id) : imageData.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (contentType != null ? contentType.hashCode() : 0);
        result = 31 * result + (href != null ? href.hashCode() : 0);
        result = 31 * result + (base64String != null ? base64String.hashCode() : 0);
        result = 31 * result + (active ? 1 : 0);
        return result;
    }
}
