package io.riots.services.model.interfaces;

import java.util.Date;

/**
 * interface for objects that were "created" 
 * by users via the REST API. 
 * CreatedObjects have a creator and a creation date.
 * @author whummer
 */
public interface ObjectCreated {

	/**
	 * Time of creation.
	 * @return
	 */
	Date getCreated();

	/**
	 * Identifier of creator.
	 * @return
	 */
	String getCreatorId();

}
