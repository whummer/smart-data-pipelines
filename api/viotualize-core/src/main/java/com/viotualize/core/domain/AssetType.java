package com.viotualize.core.domain;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents an asset type.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_ASSET_TYPES)
public class AssetType<T extends AssetType<T>> extends SmartObject<T> {

	public AssetType() {}

    public AssetType(String name) {
        super(name);
    }

}
