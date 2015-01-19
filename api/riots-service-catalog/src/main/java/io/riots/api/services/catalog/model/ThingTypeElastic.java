package io.riots.api.services.catalog.model;

import io.riots.api.services.catalog.ThingType;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * Created by omoser on 18/01/15.
 *
 * @author omoser
 */
@Document(indexName = "thing-types", type = "thing-type")
public class ThingTypeElastic extends ThingType {

    public ThingTypeElastic() {
    }

    public ThingTypeElastic(ThingType thingType) {
        setCreated(thingType.getCreated());
        setCreatorId(thingType.getCreatorId());
        setDescription(thingType.getDescription());
        setDeviceProperties(thingType.getProperties());
        setFeatures(thingType.getFeatures());
        setImageData(thingType.getImageData());
        setTags(thingType.getTags());
        setChildren(thingType.getChildren());
        setName(thingType.getName());
        setManufacturerId(thingType.getManufacturerId());
    }

}
