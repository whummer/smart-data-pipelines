package io.riots.catalog.model;

import static org.springframework.data.elasticsearch.annotations.FieldType.String;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;

@Document(indexName = "devices", type = "device", shards = 1, replicas = 0, refreshInterval = "-1", indexStoreType = "memory")
public class DeviceType {

    @Id
    private String id;

    private String name;
    
    private String manufacturer;

    @Field(type = String, store = true)
    private Collection<String> tags = new ArrayList<String>();

    public DeviceType() {

    }

    public DeviceType(String id) {
        this.id = id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Collection<String> getTags() {
        return tags;
    }

    public void setTags(Collection<String> tags) {
        this.tags = tags;
    }

	public String getManufacturer() {
		return manufacturer;
	}

	public void setManufacturer(String manufacturer) {
		this.manufacturer = manufacturer;
	}

}
