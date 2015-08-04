package io.riots.api.services.model.interfaces;

import io.riots.api.services.catalog.ImageData;

import java.util.List;


/**
 * Interface for objects that are 
 * illustrated with one or more images.
 * @author whummer
 */
public interface ObjectWithImages {

	/**
	 * Get list of images.
	 * @return
	 */
	List<ImageData> getImageData();

}
