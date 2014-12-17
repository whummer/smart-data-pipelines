package io.riots.core.model;

import org.springframework.data.mongodb.core.mapping.Document;

/**
 * This class represents a category/grouping in a world.
 * 
 * Categories are used to bring structure into the domain model, 
 * and to group related assets or asset types together.
 * 
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_CATEGORIES)
public class AssetCategory extends HierarchicalObject<AssetCategory> {

	public AssetCategory() {}
	public AssetCategory(String name) {
		super(name);
	}

	@Override
	public String toString() {
		return "AssetCategory [name=" + name
				+ ", subCategories=" + children + "]";
	}

}
