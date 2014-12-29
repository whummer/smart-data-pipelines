package io.riots.api.model;

import org.springframework.data.mongodb.core.mapping.Document;


/**
 * @author omoser
 * @author whummer
 */
@Document(collection = Constants.COLL_BASEOBJECT_CATEGORIZED)
public class Manufacturer extends BaseObjectCategorized<Manufacturer> {

	{
		category = "Manufacturer";
	}

	public Manufacturer() {
	}
	public Manufacturer(String name) {
        setName(name);
    }

}
