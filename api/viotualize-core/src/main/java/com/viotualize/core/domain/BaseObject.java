package com.viotualize.core.domain;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * @author omoser
 */
@SuppressWarnings("unchecked")
public abstract class BaseObject<T> {

    @Id
    String id;

    String name;

    String description;

    Map<String, String> properties = new HashMap<>();

    @CreatedDate

    Date created;

    public BaseObject(String name) {
        this.name = name;
        created = new Date();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public T withName(final String name) {
        this.name = name;
        return (T) this;
    }

    public T withDescription(final String description) {
        this.description = description;
        return (T) this;
    }

    public T addProperty(final String key, final String value) {
        properties.put(key, value);
        return (T) this;
    }

    public Map<String, String> getProperties() {
        return properties;
    }

    public Date getCreated() {
        return created;
    }

    public T withCreated(final Date created) {
        this.created = created;
        return (T) this;
    }

    public void setProperties(Map<String, String> properties) {
        this.properties = properties;
    }

    public void setCreated(Date created) {
        this.created = created;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof SmartObject)) return false;

        SmartObject that = (SmartObject) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
