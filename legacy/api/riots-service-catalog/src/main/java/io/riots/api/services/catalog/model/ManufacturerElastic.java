package io.riots.api.services.catalog.model;

import io.riots.api.services.catalog.Manufacturer;
import org.springframework.data.elasticsearch.annotations.Document;

/**
 * Created by omoser on 18/01/15.
 *
 * @author omoser
 */
@Document(indexName = "manufacturers", type = "manufacturer")
public class ManufacturerElastic extends Manufacturer {

    public ManufacturerElastic() {
    }

    public ManufacturerElastic(Manufacturer manufacturer) {
        setName(manufacturer.getName());
        setId(manufacturer.getId());
    }
}
