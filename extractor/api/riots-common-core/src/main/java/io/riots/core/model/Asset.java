package io.riots.core.model;

import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Represents a real-world object, denoted "asset", in the world. 
 * An {@link Asset} has an {@link AssetType}, and may be subclassed.
 * 
 * Currently known subclasses are: {@link Device}
 * 
 * @author Waldemar Hummer
 *
 * @param <AssetT> Generic class of this asset (e.g., {@link Asset} or {@link Device})
 * @param <AssetTypeT> Generic type descriptor class of this asset (e.g., {@link AssetType} or {@link DeviceType})
 */
@Document(collection = Constants.COLL_ASSETS)
public class Asset<AssetT extends HierarchicalObject<AssetT>,
					AssetTypeT extends AssetType<AssetTypeT>> extends HierarchicalObject<AssetT> {

    @DBRef
    AssetTypeT assetType;
	/**
	 * Location of this thing.
	 */
    Location location;
    /**
     * The 3D geometry associated with this asset/thing.
     */
    Object geometry;

    public Asset() {}

    public Asset(String name) {
        super(name);
    }

    public Asset<AssetT,AssetTypeT> withAssetType(final AssetTypeT type) {
        this.assetType = type;
        return this;
    }

    public Asset<AssetT,AssetTypeT> withLocation(final Location location) {
        this.location = location;
        return this;
    }

    public Location getLocation() {
		return location;
	}
    public void setLocation(Location location) {
		this.location = location;
	}
    public AssetTypeT getAssetType() {
		return assetType;
	}
    public void setAssetType(AssetTypeT assetType) {
		this.assetType = assetType;
	}
    public Object getGeometry() {
		return geometry;
	}
    public void setGeometry(Object geometry) {
		this.geometry = geometry;
	}

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Asset)) return false;

        @SuppressWarnings("unchecked")
		Asset<AssetT,AssetTypeT> device = (Asset<AssetT,AssetTypeT>) o;

        if (id != null ? !id.equals(device.id) : device.id != null) return false;

        return true;
    }

    @Override
    public int hashCode() {
        return id != null ? id.hashCode() : 0;
    }
}
