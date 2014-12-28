package io.riots.api.model;

import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonSubTypes.Type;
import com.fasterxml.jackson.annotation.JsonTypeInfo;


/**
 * @author Waldemar Hummer
 */
@Document(collection = Constants.COLL_BASEOBJECT_CATEGORIZED)
@JsonSubTypes({
	@Type(value = SemanticType.SemanticDeviceType.class, name=SemanticType.CATEGORY_DEVICE),
	@Type(value = SemanticType.SemanticPropertyType.class, name=SemanticType.CATEGORY_PROPERTY),
	@Type(value = Manufacturer.class, name=Manufacturer.CATEGORY_MANUFACTURER)
})
@JsonTypeInfo(
		use = JsonTypeInfo.Id.NAME,
		include = JsonTypeInfo.As.PROPERTY,
		property = "category"
)
public abstract class BaseObjectCategorized<T> extends BaseObjectCreated<T> {

	public static final String CATEGORY_PROPERTY = "Property";
	public static final String CATEGORY_DEVICE = "Device";
	public static final String CATEGORY_MANUFACTURER = "Manufacturer";

    String category;

    public String getCategory() {
		return category;
	}
    public void setCategory(String category) {
		this.category = category;
	}


	@Override
	public int hashCode() {
		final int prime = 31;
		int result = super.hashCode();
		result = prime * result
				+ ((category == null) ? 0 : category.hashCode());
		return result;
	}
	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (!super.equals(obj))
			return false;
		if (getClass() != obj.getClass())
			return false;
		BaseObjectCategorized<?> other = (BaseObjectCategorized<?>) obj;
		if (category == null) {
			if (other.category != null)
				return false;
		} else if (!category.equals(other.category))
			return false;
		return true;
	}

}
