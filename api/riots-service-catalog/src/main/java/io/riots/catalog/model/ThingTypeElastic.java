package io.riots.catalog.model;

import io.riots.services.catalog.ThingType;
import io.riots.services.scenario.Thing;

import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.Document;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldIndex;
import org.springframework.data.elasticsearch.annotations.FieldType;

/**
 * Represents the "type" of a {@link Thing}
 * 
 * @author Waldemar Hummer
 * @author riox
 */
@Document(indexName = "thing-types", type = "thing", shards = 1, replicas = 0, refreshInterval = "-1", indexStoreType = "memory")
public class ThingTypeElastic extends ThingType {

	@Id
	@Override
	public String getId() {
		return super.getId();
	}
	
	@Field(type=FieldType.String, store=true)
	@Override
	public List<String> getTags() {
		return super.getTags();
	}
	
	@Field(type=FieldType.String, store=true, index=FieldIndex.analyzed)
	@Override
	public Map<String, String> getFeatures() {
		return super.getFeatures();
	}
	
}
