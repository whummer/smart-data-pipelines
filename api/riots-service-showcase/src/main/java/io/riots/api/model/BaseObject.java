package io.riots.api.model;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;

/**
 * @author omoser
 */
@SuppressWarnings("unchecked")
public abstract class BaseObject<T> {

    @Id
    String id;

    String name;

    String description;

    Map<String,String> properties = new HashMap<>();

    List<String> tags = new LinkedList<String>();

    /**
     * Default c'tor.
     */
    public BaseObject() { }
    /**
     * C'tor with name.
     */
    public BaseObject(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }
    public void setId(String id) {
		this.id = id;
	}

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }
    public String getDescription() {
        return description;
    }

    public List<String> getTags() {
		return tags;
	}
    public void setTags(List<String> tags) {
		this.tags = tags;
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
    public void setProperties(Map<String, String> properties) {
		this.properties = properties;
	}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BaseObject)) return false;

        BaseObject<T> that = (BaseObject<T>) o;

        if (description != null ? !description.equals(that.description) : that.description != null) return false;
        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        if (name != null ? !name.equals(that.name) : that.name != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (name != null ? name.hashCode() : 0);
        result = 31 * result + (description != null ? description.hashCode() : 0);
        return result;
    }
}
