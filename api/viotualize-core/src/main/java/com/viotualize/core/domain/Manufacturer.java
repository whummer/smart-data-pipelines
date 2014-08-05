package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * @author omoser
 */

@Document(collection = Constants.COLL_MANUFACTURERS)
public class Manufacturer extends BaseObjectCreated<Manufacturer> {

    protected Manufacturer(String name) {
        super(name);
    }
}
