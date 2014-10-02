package io.riots.core.model;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_MANUFACTURERS)
public class Manufacturer extends BaseObject<Manufacturer> {

    public Manufacturer(String name) {
        super(name);
    }
}
